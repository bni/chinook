---
name: whats-for-lunch
description: Find out what's for lunch
---

# What's for Lunch

## Instructions
The user will ask you for what's for lunch a specific day.

The user and restaurant is located in the CET timezone.

On the weekend no lunch is served. In those cases return "Restaurant is closed on weekends.".

From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out what is served for lunch.

Download the sheet as a CSV. In the CSV, find the column for the day the user asks for.

The lunches for a week are written inside a single column for the week. Usually in the column for Monday of that week.

The lunches are written in a single column on the last row, or close to the last row.

If the result contains the text "STÄNGT" or similar, then anwser "Restaurant is closed that day.".

If you cant find what's for lunch answer with "I don't know what's for lunch.".

Otherwise, answer with the days lunch.
