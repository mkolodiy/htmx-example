package main

import (
	"html/template"
	"net/http"
	"strconv"
)

type Person struct {
	Name        string
	Description string
}

type Data struct {
	Persons      []Person
	PersonsCount int
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
			Persons:      persons,
			PersonsCount: len(persons),
		})
	})

	http.HandleFunc("/personsCount", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(strconv.Itoa(len(persons))))
	})

	http.HandleFunc("/form", func(w http.ResponseWriter, r *http.Request) {
		r.ParseForm()
		name := r.Form["name"][0]
		description := r.Form["description"][0]

		newPerson := Person{
			Name:        name,
			Description: description,
		}

		persons = append(persons, newPerson)

		w.Header().Add("HX-Trigger-After-Swap", "update-persons-count")

		tmpl := template.Must(template.ParseFiles("person.html"))
		tmpl.Execute(w, newPerson)
	})
	http.ListenAndServe(":4444", nil)
}
