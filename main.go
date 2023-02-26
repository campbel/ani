package main

import (
	"errors"
	"image"
	"image/color"
	"image/color/palette"
	"image/draw"
	"image/gif"
	"image/png"
	"os"
	"path"
	"sync"
	"time"

	"github.com/anthonynsimon/bild/transform"
	"github.com/campbel/yoshi"
	"github.com/charmbracelet/log"
)

const (
	FPS = 50.0
)

var (
	logger = log.New(log.WithTimestamp(), log.WithTimeFormat(time.Kitchen), log.WithCaller())
)

type Options struct {
	Images []string       `yoshi:"-i,--image;Image layer;"`
	RPS    float64        `yoshi:"--rps;Rotations per second;1"`
	Center map[string]int `yoshi:"--center;Center point;"`
	Debug  bool           `yoshi:"-d,--debug;Enable debug mode;false"`
}

func main() {
	yoshi.New("ani").Run(func(options Options) error {
		if len(options.Images) == 0 {
			return errors.New("no images specified")
		}

		if options.Debug {
			logger.SetLevel(log.DebugLevel)
		}

		for _, image := range options.Images {
			ext := path.Ext(image)
			switch ext {
			case ".png":
				file, err := os.Open(image)
				if err != nil {
					return err
				}
				img, err := png.Decode(file)
				if err != nil {
					return err
				}
				result := makeGif(getFrames(img, int(FPS/options.RPS), options.Center))
				out, err := os.Create("out.gif")
				if err != nil {
					return err
				}
				defer out.Close()
				return gif.EncodeAll(out, &result)
			case ".jpg", ".jpeg":
				// do something else
			default:
				return errors.New("unknown image type")
			}
		}

		return nil
	})
}

func getFrames(img image.Image, frames int, centerPoint map[string]int) []image.Image {
	var images []image.Image = make([]image.Image, frames)

	x := centerPoint["x"]
	if x == 0 {
		x = img.Bounds().Dx() / 2
	}
	y := centerPoint["y"]
	if y == 0 {
		y = img.Bounds().Dy() / 2
	}

	i := 0
	angle := float64(360) / float64(frames)
	var wg sync.WaitGroup
	for ang := float64(0); ang < 360; ang += angle {
		wg.Add(1)
		go func(i int, ang float64) {
			images[i] = transform.Rotate(img, ang, &transform.RotationOptions{Pivot: &image.Point{x, y}})
			wg.Done()
		}(i, ang)
		i++
	}
	wg.Wait()

	return images
}

func makeGif(frames []image.Image) gif.GIF {
	var (
		frameDelay                   = 100 / FPS
		pi         []*image.Paletted = make([]*image.Paletted, len(frames))
		delay      []int             = make([]int, len(frames))
		disposal   []byte            = make([]byte, len(frames))
	)
	logger.Info("making a gif", "frames", len(frames))

	var wg sync.WaitGroup
	for i, frame := range frames {
		wg.Add(1)
		go func(i int, frame image.Image) {
			start := time.Now()
			pi[i] = renderFrame(frame)
			delay[i] = int(frameDelay)
			disposal[i] = gif.DisposalPrevious
			logger.Debug("rendered frame", "index", i, "duration", time.Since(start))
			wg.Done()
		}(i, frame)
	}
	wg.Wait()
	return gif.GIF{
		Image:     pi,
		Delay:     delay,
		LoopCount: 0,
		Disposal:  disposal,
	}
}

func renderFrame(img image.Image) *image.Paletted {
	opts := gif.Options{
		NumColors: 217,
		Drawer:    draw.FloydSteinberg,
	}

	pimg := image.NewPaletted(img.Bounds(), append(palette.WebSafe, image.Transparent))
	if opts.Quantizer != nil {
		pimg.Palette = opts.Quantizer.Quantize(make(color.Palette, 0, opts.NumColors), img)
	}
	opts.Drawer.Draw(pimg, img.Bounds(), img, image.Point{})
	return pimg
}
