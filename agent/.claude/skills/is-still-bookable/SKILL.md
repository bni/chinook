---
name: is-still-bookable
description: Is it still possible to book lunch?
---

# Is it still possbile to book lunch

## Instructions
The user will ask you if it is still possible to book lunch.

The user and restaurant is located in the CET timezone.

First figure out what date the user is asking for.

From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out if a days lunch is still bookable.

Download the sheet as a CSV. In the CSV, find the column for the day the user asks for.

Determine if it can still be booked. Rules for still being bookable is:
* It must be atleast the day before.
* If the row "Guests (Representation)" contains the text FULL for the asked day, it is not possible to book.
* If the column contains the text "STÄNGT", it is not possible to book.
