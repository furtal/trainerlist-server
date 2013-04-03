Trainerlist Server
------------------

This is a server which is accessible through the REST protocol.


Setting up
==========

Just open a command line and do

        npm install

To start the server, run

        npm start

This creates a server listening on port 8080.


Available Methods
=================

Here we look at all the methods available on the server.

On success, the response is always HTTP 200. If the response is not HTTP 200, there was an error.

In the future, when there is authentication support, HTTP 403 will indicate that the user was not authenticated correctly or that his session was expired for some reason. When this happens, redirect the user to a login prompt.

The HTTP verbs used are GET and POST.

 - GET is always used to retrieve data as a single object or a list of objects, with the guarantee that no changes will occur.
 - POST requests change the state of the information, by creating, deleting, or changing it.

Read more on each method available below.


### Trainer methods (the trainer is also the user for now)

A trainer object is comprised of the following keys:

 - `_id` (string): The unique id of the user. Generated by the server.
 - `_rev` (string): The current version of the object. Generated by server, and updated every time the object gets edited.
 - `email`: valid user e-mail
 - `username`: username for logging in. Only alphanumeric characters, numbers and `._-`.
 - `firstName`
 - `lastName`


#### Create trainer: `POST` to `/trainer`

Send a POST request to this URL to create a trainer. Send the following POST data:

 - email
 - username
 - firstName
 - lastName
 - password

On success, you get the trainer object as JSON in a HTTP 200 response.


#### Get trainer by ID: `GET` to `/trainer/<id>`

Use a HTTP GET request to retrieve the trainer by its ID.

The response is a trainer object in a 200 HTTP in case of no errors. 


#### Edit trainer information: `POST` to `/trainer/<id>`

HTTP POST to this URL (the same as to "Get trainer by ID") to edit the trainer.

Send the same keys as you would to create a trainer, except for the following ones.

 - password: this key may be left blank if the user does not want to change his password
 - rev: send this key to validate the version against the one existing in the database. This avoids concurrent editing issues.


#### Delete a trainer: `POST` to `/trainer/<id>/delete`

POST to the above URL to delete the trainer with the same ID.

Expect HTTP 200 to signal successful deletion.


### Trainee methods

TODO

### Authentication

#### Login a user: `POST` to `/authentication/login`

To login a user, POST to the above URL with the following keys:

 - login: the username or email of the user.
 - password



In this dummy server stage, you may only use `email@email.com` and `password` as credentials.
