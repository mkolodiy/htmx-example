package main

import (
	"html/template"
	"net/http"
)

type Person struct {
	Name        string
	Description string
}

type Data struct {
	Persons []Person
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

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		files := []string{
			"base.html",
			"home.html",
		}

		ts, _ := template.ParseFiles(files...)
		ts.ExecuteTemplate(w, "base", Data{
			Persons: persons,
		})
	})

	http.HandleFunc("/form", func(w http.ResponseWriter, r *http.Request) {
		r.ParseForm()
		name := r.Form["name"][0]
		description := r.Form["description"][0]
		tmpl := template.Must(template.ParseFiles("person.html"))
		tmpl.Execute(w, Person{
			Name:        name,
			Description: description,
		})
	})
	http.ListenAndServe(":4444", nil)
}
