---
name: how-many-guests
description: Find out how many guests there are a specific day
---

# How many guests

## Instructions

### Days date
* Find out what date is asked for.
* On the weekend no lunch is served, then answer 0 guests.

### Google sheet
* From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out how many guests.
* Download the sheet as a CSV. Find the column for the day the user asks for and use that column going forward.

### Number of guests
* Count the nr of guests, it is specified on the row marked "Total".

### Additional guests
* In the same column on the rows below there is freeform text about additional guests. These should be added to the total.

### Additional guests parsing rules
* If specified as "Person + n", it counts as n + 1.
* If specified as "n (Person)", it counts as n.
