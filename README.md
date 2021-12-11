# ARea Explorer API

This is the REST API used in [Web frontend](https://github.com/arnaud18o5/AR_VR_Map_WebSite)
and [Android mobile app](https://github.com/TuomasB73/AR_VR_Map_App) for application called ARea Explorer, more details
about the application itself and it's purposes will be found from the links, please take a look at them to get a better
context about what this application is about as a whole. This README will only cover the topics relevant to the backend
such as:

* General info
* Prerequisites
* Getting started
* Deployment
* API endpoits

## General info

This is a Node.js application using MVC design pattern, Express framework and MongoDB. The application itself is hosted
in Microsoft Azure. The main purpose of this backend is to store 3D objects into Azure storage and retrieve the
requested references for the various objects. In addition to that this API is also responsible for registering and
logging in users and doing the authentication required to make the requests.

## Prerequisites

* Node has to be installed in order to be able to run this application on chosen platform.
* Azure account and Azure Storage account with Containers called ```objects``` and ```poiimages```.
    * This README won't go through how to get started with Azure, instead check sources such
      as [Get started with Azure](https://azure.microsoft.com/en-us/get-started/#explore-azure).
    * The application itself could be hosted somewhere else than Azure.

## Getting started and deployment

* Clone the repository and run npm i in order to install the required packages.
* cd to cloned repository.
* Required files / directories:
    * ```touch .env```
    * ``` mkdir uploads```
* Environment variables required to run the application on localhost
    * ```MONGOCONNECTION```
        * This is the mongoDB connection string that is required in order to connect to database.
        * For localhost typically something like: ```mongodb://127.0.0.1:27017/<your-db-name>```
    * ```JWT```
        * This the secretOrKey, secretOrKey is a string or buffer containing the secret (symmetric) or PEM-encoded
          public key (asymmetric) for verifying a JSON Web Token's (JWT) signature, it is used when a request is done
          using a route that requires authentication and is part of
          the [Passport authentication middleware](http://www.passportjs.org/packages/passport-jwt/) JWT authentication
          strategy.
        * This can be a randomly generated string.
    * ```AZURE_STORAGE_CONNECTION_STRING```
        * This is the connection string checked at runtime to authorize requests made to Azure Storage.
        * Find it in Azure → YOUR STORAGE ACCOUNT → Security + networking → Access keys


* The source code has a piece of code checking where the application is launched. *(utils/utils.js)*
    * If the application is to be launched somewhere else than localhost following environment variable rules apply:
    * ```NODE_ENV```
        * To launch on Azure set this value to ```production```
    * Test development platform used in development of this app was setup in a CentOS server
        * Define a ```PORT``` variable to be used in addition to the ```NODE_ENV``` variable, this is the port where the
          application is listening to requests *(Typically set to be 3000, 5000, 8000 or 8080 but the nunber doesn't
          really matter)*
    * *NOTE: Azure doesn't require PORT to be defined as it is automatically done if the app is launched on that
      platform*

## API endpoints

### Authentication route

#### Register users
* URL:
    * ``auth/register``
* Method
    * ``POST``
        * Body
            * username
            * password
            * (optional contentManager)
        * Query
            * None
              <br></br>
* Response:
    * json detailing if the registration was succesful
      <br></br>

#### Login users
* URL:
    * ``auth/login``
* Method
    * ``POST``
        * Body
            * username
            * password
            * (optional contentManager)
        * Query
            * None
* Response:
    * json detailing if the login was succesful

## All endpoints below require a bearer token (JWT) to be sent in the "Authorization" header. Token contains the information about the user who is doing the request.

### User route

#### Get user scanned items

* URL:
    * ``user/userscanneditems``
* Method
    * ``GET``
        * Body
            * None
        * Query
            * None
* Response:
    * Array of scanneditem ids
      <br></br>

#### Post a new scanned item

* URL:
    * ``user/userscanneditems/:scanneditemid``
* Method
    * ``POST``
        * Body
            * None
        * Query
            * None
* Response:
    * Message detailing if a new scanned item was added
      <br></br>

#### Delete a scanned item

* URL:
    * ``user/userscanneditems/:scanneditemid``
* Method
    * ``DELETE``
        * Body
            * None
        * Query
            * None
* Response:
    * Message detailing if a scanned item was removed
      <br></br>

### AR item route

#### Get a single AR Item

* URL:
    * ``/aritem/:id``
* Method
    * ``GET``
        * Body
            * None
        * Query
            * None
* Response:
    * A single AR item
      <br></br>

#### Post a new 3D object

* URL:
    * ``/aritem/3d``
* Method
    * ``POST``
        * Body
            * gltf (file)
            * bin (file)
            * imageGallery (file)
            * logoImageReference (file)
            * name
            * category
            * description
            * latitude
            * longitude
        * Query
            * None
* Response:
    * Message detailing if a new object was added to Azure and information stored to database
      <br></br>

#### Get all the objects of a contentManager (a person who has right to post items)

* URL:
    * ``/aritem/3d``
* Method
    * ``GET``
        * Body
            * None
        * Query
            * None
* Response:
    * Array of 3D object infos
      <br></br>

#### Update a 3D object

* URL:
    * ``/aritem/update/:aritemid?param={}``
* Method
    * ``PATCH``
        * Body
            * ``<Value for the field to be patched>``
        * Query
            * param (``<Field to be patched>``)
* Response:
    * Message telling whether the update of 3D object was successful or not
      <br></br>

#### Delete a 3D object

* URL:
    * ``/aritem/delete/:aritemid``
* Method
    * ``DELETE``
        * Body
            * None
        * Query
            * None
* Response:
    * Message telling whether the deletion of 3D object was successful or not
      <br></br>

#### Post a point of interest

* URL:
    * ``/aritem/pois/:aritemid``
* Method
    * ``POST``
        * Body (formdata)
            * avatar (file)
            * name
            * description
            * category
            * latitude
            * longitude
            * x
            * y
            * z
        * Query
            * None
* Response:
    * Message telling if the whether the insertion was successful or not
      <br></br>

#### Update a basic value of a point of interest (no map coordinates)

* URL:
    * ``/aritem/pois/:aritemid?id={}&param={}``
* Method
    * ``PATCH``
        * Body
            * ``<Value for the field to be patched>``
        * Query
            * id (``<Point of interest id>``)
            * param (``<Field to be patched>``)
* Response:
    * Message telling whether the update of basic value of point of interest was successful or not
      <br></br>

#### Update a point of interest map coordinates

* URL:
    * ``/aritem/pois/:aritemid?id={}``
* Method
    * ``PUT``
        * Body
            * x
            * y
            * z
        * Query
            * id (``<Point of interest id>``)
* Response:
    * Message telling whether the update of map coordinates was successful or not
      <br></br>

#### Delete a point of interest

* URL:
    * ``/aritem/pois/:aritemid?id={}``
* Method
    * ``DELETE``
        * Body
            * None
        * Query
            * id (``<Point of interest id>``)
* Response:
    * Message telling whether the deletion of point of interest was successful or not
      <br></br>




















