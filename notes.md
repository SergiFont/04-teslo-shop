AUTH

Inside decorators folder, the `auth` decorator is the master. It calls both `get.user` and `role.protected`, so you only need to add one decorator instead of two. These part is really important cause we are talking about security. More decorators to add at every endpoint means more probabilities for human (and IA) mistakes to happen when we need to do changes.

Get.user:
Gets info from the request and checks if the user is resgistered or not. Acts in consequence.

Role.protected:
Take the roles defined in the ValidRoles interface, and sets them as the only ones valid.

Auth:
Uses both decorators mentioned above, passing an argument of role/s for the `Role.protected`. This roles we pass, are the only ones that can acces that specific endpoint.

Examples:

`@Auth()` : Any registered user can acces the endpoints as long as they are registered, are active on the database, and got a token.
`@Auth(ValidRoles.admin)` : Only the admin role can acces the endpoint. ValidRoles is the inferface where we define them.


INTERFACES
