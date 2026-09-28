# AI-Powered Chatbot for a College Website

A virtual assistant I built for UEM Jaipur (University of Engineering & Management). It answers the questions students and parents keep asking — admissions, fees, hostel, placements, exams — and it also comes with a small student portal, an admin panel and an analytics dashboard, so it feels more like a mini campus app than just a chat box.

Everything runs in the browser. No framework, no build step, no database to set up. Just HTML, CSS and vanilla JavaScript (plus a tiny Node server if you want one).

# Why I made this

College websites are full of information, but nobody wants to dig through ten pages to find the hostel fee or the library timings. I wanted to see if one chat window could handle all of that, in English and Hindi, and still be fun to use. It grew a lot from there. 

# What it can do

The chatbot

~ Answers common college questions (admissions, eligibility, fees, hostel, library, placements, scholarships, campus, rankings, location, etc.)
~ Works in English and Hindi, with a one-click language toggle
~ Voice input and text-to-speech using the browser's Speech APIs
~ Optional real AI mode using the Gemini API (or any OpenAI-compatible endpoint). If no API key is set, it falls back to the built-in keyword-based answers, so it always works
~ Upload a document and get an AI summary of it
~ Summarize the chat, and export the conversation as TXT or PDF
~ Quick-reply chips so people don't have to type
~ A glowing 3D avatar (Three.js) that reacts while the bot is "thinking"

# Student portal

Register / log in with a roll number and password
Forgot-password flow using a security question
Temporary lockout after too many wrong login attempts
Dashboard with attendance, timetable, assignments, fee dues and a CGPA calculator
Download an exam hall ticket
Auto logout after inactivity

# Admin panel

Teach the bot new answers (keyword → response) without touching code
Bulk import responses from CSV
Schedule announcements
Add your Gemini / OpenAI key and turn AI mode on or off
See which keywords get used the most

# Analytics

Total queries, match accuracy, voice requests and registered students
Charts drawn with plain canvas (no chart library)

# Extras

Notice board with a notification bell
Dark / light theme
Installable as a PWA (works offline for the basics thanks to a service worker)
A short onboarding tour for first-time visitors
