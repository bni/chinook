---
name: whats-for-lunch
description: Find out what's for lunch a specific date
---

# What's for Lunch

## Instructions

### Days date
* Find out what date is asked for.
* On the weekend no lunch is served, then answer "Restaurant is closed on weekends".

### Google sheet
* From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out what is served for lunch.
* Download the sheet as a CSV. Find the column for the day the user asks for and use that column going forward.

### Closed days
* If the column contains the text "STÄNGT", then answer "Restaurant is closed".
* If the column contains the text "FULLBOKAT", then answer "Restaurant is fully booked".
* If the restaurant is closed, never answer with what is for lunch.

### Lunch menu
* Exists inside a single column for the entire week. Usually the monday column.
* Is located in the monday column for the week.
* Exists in a single column on the last row.
