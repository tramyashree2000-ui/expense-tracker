# Expense Tracker (Full Stack)

## Overview

A minimal full-stack expense tracking app.

## Tech

* Backend: Node.js, Express, SQLite
* Frontend: React (Vite)

## Features

* Add expenses
* View list
* Filter by category
* Sort by date
* Total calculation

## Key Decisions

* Idempotency key to prevent duplicate entries
* Amount stored in paise (integer)

## Trade-offs

* No auth
* Minimal UI

## Run locally

Backend:
cd backend
npm install
node index.js

Frontend:
cd frontend
npm install
npm run dev
