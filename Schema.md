Tasks Table:

task_id (Primary Key, Auto-increment)
title (Text, Not Null)
category (Text)
tags (Text)
due_date (Date)
priority (Text)
reminder (Date)
done (Boolean)
Subtasks Table:

subtask_id (Primary Key, Auto-increment)
task_id (Foreign Key referencing Tasks table)
description (Text, Not Null)
Activity Logs Table:

log_id (Primary Key, Auto-increment)
log (Text, Not Null)
timestamp (DateTime)