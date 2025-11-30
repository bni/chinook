---
name: is-still-bookable
description: Is it still possible to book lunch?
---

# Is it still possible to book lunch

## Instructions

### Days date
* Find out what date is asked for.
* On the weekend no lunch is served, so it is not possible to book.

### Google sheet
* From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out what is served for lunch.
* Download the sheet as a CSV. Find the column for the day the user asks for and use that column going forward.

### Closed days
* If the column contains the text "STÄNGT" or "FULLBOKAT", then it is not possible to book.
