[![Build Status](https://travis-ci.org/MWGitHub/sometimes-survey.svg?branch=master)](https://travis-ci.org/MWGitHub/sometimes-survey)

# sometimes-survey

###Architecture

#####Overview
General architecture will be a survey service that can handle multiple types of survey conditions for more than just articles if needed. The way to handle a type would be to provide schemes to the survey server which would handle validity and criteria checks. Schemes are chosen based on the survey property.

Other services such as analytics that rely on the data can listen to events and replicate the data. This allows a more specific database to be used for different situations.

#####Technology

**Persistence**   
Postgres is used for storing the results of each item. I chose this due to the structure of the survey data being well defined for some columns which will make it easier to run aggregate queries. For less defined data, jsonb is used.

**Backend**  
I chose Hapi due to the great documentation, ease of use, support by Walmart Labs, powerful route configuration, and seneca integration.

**Frontend**  
Deku will be used for rendering the component. The decision was based on the functional style promoting statelessness which can reduce complexity, good performance, and curiosity.

**Tracking**  
Callbacks are used around tracking events to allow developers to choose how to deal with the events when they occur in the component. Impression and conversion events are also sent to the survey server to store the results if enabled.

#####Data Model

Survey Event Model  
Fingerprint can be used to see more detailed user behavior. The fingerprint is not guaranteed to be unique but the collision chance is low enough for this case.

```
surveys
  integer (pk)    - id
  string          - name (unique)
  string          - scheme
  string          - question
  boolean         - deployed
  datetime        - deploy_time
  timestamp

events
  integer (pk)    - id
  integer (fk)    - survey_id
  string  (index) - item_key (id of the tracked item)
  uuid (index)    - fingerprint (fingerprint unique to the current user)
  string          - event
  jsonb           - data
  timestamp
```

#####Folder Structure
```
/
  example/
    index.html
    package.json
  survey-server/
    examples/
    docs/
    lib/
    test/
    index.js
  survey-scheme-article/
    lib/
    test/
    index.js
  survey-component/  
    examples/
    lib/
    test/
    index.js
```  

The root will have three main folders, one for the server, one for the scheme to handle articles, and one for the component. Normally I would split these into different repositories since each are not directly dependent on any of the others. The example folder will install directly from the other folders in this case and will contain a full example of a site and survey.

Each will have fake responses for handling article endpoints and analytics endpoints for testing and examples.

#####Client/Server Flow

The flow will be in this order:

1. Client requests page
1. Static server serves SPA index
1. Client requests articles with pagination
1. Article server returns list of articles
1. Client requests if survey should be shown from the survey service API
    * Does not call the survey service API if already cookied against
    * Only requests when the article is being focused on as someone quickly scrolling through should not care about seeing a survey
1. Survey service replies with able to show or not
1. Client checks if survey should be displayed depending on events
1. Survey or like is acted on, sends tracking to to survey service
    * Up to analytics service to listen to events of the survey service
1. Client goes on to the next prompt or hides regardless of result for better usability

#####Survey Endpoints

Private endpoints require authentication.
More detailed information about endpoints [here][server-endpoints]

`GET  auth /v1/surveys/`: Retrieve all surveys.  
`POST auth /v1/surveys/`: Create a new survey.  
`GET  auth /v1/surveys/{survey_id}`: Retrieve a single survey info.  
`POST auth /v1/surveys/{survey_id}/deploy`: Deploy a survey.  
`POST auth /v1/surveys/{survey_id}/disable`: Disable a survey.  

`GET auth /v1/surveys/{survey_id}/items`: Retrieve all items.  
`GET auth /v1/surveys/{survey_id}/items/{id}/`: Retrieve results matching the id  
`GET /v1/surveys/{survey_id}/items/{id}/status`:  Check if a survey should be shown for the given item.  
`POST /v1/surveys/{survey_id}/items/{id}/events`: Create an event for the item.  

#####Implementation Steps

Each step creates tests before creating the implementation. Tests and examples that require seed data will be created as needed.

1. Survey Server
    1. Database Integration
    1. Database schema
    1. Scheme Integration
    1. Authentication check on routes
    1. Item handlers and routes
    1. Events handlers and routes
    1. Special retrieval hanlders and routes
    1. Survey change broadcast (Not implemented)
1. Article Scheme
    1. Article validation
    1. Article survey condition checks
1. Survey Component
    1. Send events to survey endpoints
    1. Get focused article
    1. Check if survey should be asked locally
    1. Request for survey status on focus if local check passes
    1. Check if on 75% of article
    1. Show survey if needed
    1. Show "like" if needed



[server-endpoints]: https://github.com/mwgithub/sometimes-survey/blob/master/survey-server/docs/
