# EnviConnect

A responsive front-end community hub for discovering, joining, and creating local sustainability initiatives.

## Overview

EnviConnect presents local projects such as clean-ups, growing initiatives, and educational workshops in a simple community-focused interface. It was built as a browser-only prototype to demonstrate filtering, form handling, and persistent client-side state without a backend.

## Features

- Browse sustainability projects in a responsive card layout
- Filter projects by clean-up, growing, or education categories
- Join or leave a project with live participant totals
- Create a project through a native accessible dialog form
- Persist created projects and participation state with `localStorage`
- Display live project, participant, and pledged-hour counts

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

## Architecture

```text
Browser UI
   ↓
Vanilla JavaScript state and event handlers
   ↓
localStorage persistence
```

This project has no backend, database, API, authentication, or environment variables.

## Screenshots

No screenshots are currently included in the repository.

## Running Locally

Clone the repository and serve the static files:

```bash
git clone https://github.com/akvikas/enviconnect.git
cd enviconnect
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

You can also open `index.html` directly in a modern browser. Using a local server is recommended for development.

## Project Structure

```text
index.html   # Page structure, dialog form, and card template
styles.css   # Responsive visual design
app.js       # Project state, filtering, persistence, and interactions
```

## Interview Highlights

- Built dynamic project cards from an HTML template rather than duplicating markup.
- Used `localStorage` to persist project and participation state without a server.
- Implemented category filtering with a single render function that updates the interface from state.
- Used a native `dialog` element and client-side form validation for project creation.
- Kept the layout responsive with CSS grid and a mobile breakpoint.

## Future Improvements

- Add a backend and database for shared multi-user projects.
- Add user accounts and server-side validation.
- Add map-based discovery and date filtering.
- Add automated browser tests and deployment.

## Author

[Vikas AK](https://github.com/akvikas)
