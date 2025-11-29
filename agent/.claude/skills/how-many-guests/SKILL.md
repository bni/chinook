---
name: how-many-guests
description: Find out how many guests there are
---

# How many guests

## Instructions
The user will ask you how many guests there are on a specific day.

The user and restaurant is located in the CET timezone.

First figure out what date the user is asking for.

From the Google sheet specified in environment variable $LUNCH_GOOGLE_SHEET find out what the total is.

Download the sheet as a CSV. In the CSV, find the column for the day the user asks for.

Count the nr of guests, it is specified on the row marked "Total".

In the same column on the rows below there is freeform text about additional guests. Count these in the result also.
There can be additional guest specified on the format "Person + 2" etc. In this case count it as 1 + 2 = 3.
