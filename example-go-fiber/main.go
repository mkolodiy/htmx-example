package main

import (
	"log"
	"strconv"

	"github.com/aymerick/raymond"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/handlebars/v2"
)

type Person struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func main() {
	persons := []Person{
		{
			Name:        "John Doe",
			Description: "Test",
		},
		{
			Name:        "Bob Williams",
			Description: "Test",
		},
	}

	// Create a new engine
	engine := handlebars.New("./views", ".hbs")

	engine.Engine.AddFunc("ifNotEquals", func(arg1 int, arg2 int, options *raymond.Options) string {
		if arg1 != arg2 {
			return options.Fn()
		}
		return options.Inverse()
	})

	// Or from an embedded system
	// See github.com/gofiber/embed for examples
	// engine := html.NewFileSystem(http.Dir("./views", ".hbs"))

	// Pass the engine to the Views
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Get("/", func(c *fiber.Ctx) error {
		// Render index within layouts/main
		return c.Render("home", fiber.Map{
			"persons":          persons,
			"personLengthZero": len(persons) == 0,
			"personsCount":     len(persons),
		}, "base")
	})

	app.Get("/personsCount", func(c *fiber.Ctx) error {
		return c.SendString(strconv.Itoa(len(persons)))
	})

	app.Post("/form", func(c *fiber.Ctx) error {
		name := c.FormValue("name")
		description := c.FormValue("description")

		newPerson := Person{
			Name:        name,
			Description: description,
		}

		persons = append(persons, newPerson)

		c.Append("HX-Trigger-After-Swap", "update-persons-count")

		return c.Render("person", fiber.Map{
			"person": newPerson,
		})
	})

	log.Fatal(app.Listen(":3000"))
}
