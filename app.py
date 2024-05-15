from flask import Flask, render_template, request #import flask library
import requests #  import requests library
import json #   import json library
import re # import re library

app = Flask(__name__) #create a flask app
spoonacular_api_base_url = 'https://api.spoonacular.com/' #spoonacular api base url
spoonacular_complex_search_endpoint = 'recipes/complexSearch' # endpoint for complex search
spoonacular_recipe_summary = 'summary' # endpoint for recipe summary
# spoonacular_api_key = '5a83ebe6c5d744a9938a06ee1ab8a8ac'
#spoonacular_api_key = 'a4c16ba3750e41b09919095fde43c1ee'
spoonacular_api_key = '03dff108052c4b8b844798850217b65f'

# open diets.json file and store it in diets variable to access in front end
with open('diets.json') as dietJsonFile:
    diets = json.load(dietJsonFile)

# open intolerances.json file and store it in intoleranceOptions variable to access in front end
with open('intolerances.json') as intoleranceJsonFile:
    intoleranceOptions = json.load(intoleranceJsonFile)

#route for home page
@app.route('/', methods=['POST', 'GET'])
def index():
    #if user submits the search form (handle POST request)
    if request.method == 'POST':
        
        #get the form data, diet, intolerance and query
        diet = request.form.getlist('diet[]')
        intoleranceList = request.form.getlist('intolerance[]')
        query = request.form['query']

        #convert list to string
        intoleranceString = ','.join(intoleranceList)
        dietString = ','.join(diet)

        #create the url with api key and number of recipes to return (100)
        url = spoonacular_api_base_url + spoonacular_complex_search_endpoint + f'?apiKey={spoonacular_api_key}&number=100'

        #if user has selected diet, add it to the url
        if query:
            url += f'&query={query}'

        #if user has selected diet, add it to the url
        if diet:
            url += f'&diet={dietString}'

        #if user has selected intolerance, add it to the url
        if intoleranceString:
            url += f'&intolerance={intoleranceString}'

        #call spoonacular api
        response = requests.get(url)

        #store api response status code
        responseStatus = response.status_code

        #if api response status is 402, return html with error message
        if responseStatus == 402:
            return render_template(
                'index.html',
                diets=diets,
                diet=diet,
                intoleranceList=intoleranceList,
                intoleranceOptions=intoleranceOptions,
                error={
                    "message": 'Sorry.. free daily quota from Spoonacular API (150 requests) exceeded, please try again after midnight'
                }
            )

        #api call is successful, store api response as json
        jsonResponse = response.json()

        #store recipes from the api response in variable
        recipes = jsonResponse['results']

        #store total Recieps count in variable
        totalResults = jsonResponse['totalResults']

        #calculate the next pages recipe offset since api only returns 10 at a time 
        newOffset = (jsonResponse['number'] + jsonResponse['offset'])

        #detect if has next page based on newOffset and totalRecipes available
        hasNextPage = newOffset < totalResults
    
        #store pagination data into object, for front end to access
        paginateData = {
            "total": totalResults,
            "showing_total": newOffset if newOffset <= jsonResponse['totalResults'] else jsonResponse['totalResults'],
            "next_page": f'{url}&offset={newOffset}' if hasNextPage else False
        }
        
        #return html with all the above data
        return render_template(
            'index.html',
            query=query,
            diet=diet, 
            intoleranceList=intoleranceList,
            diets=diets, 
            recipes=recipes,
            paginateData=paginateData,
            status=responseStatus,
            intoleranceOptions=intoleranceOptions
        )
    else:
        #http request is GET

        #get the query parameters from the url
        diet = request.args.get('diet[]')
        intoleranceList = request.args.get('intolerance[]')
        query = request.args.get('query')

        #if diet or intoleranceList is None, set it to empty list
        if diet is None:
            diet = []

        if intoleranceList is None:
            intoleranceList = []

    #return html with all the above data
    return render_template(
        'index.html',
        diet=diet,
        intoleranceList=intoleranceList,
        diets=diets,
        recipes=[],
        query=query,
        intoleranceOptions=intoleranceOptions
    )


#route for getting recipes based on pagination
@app.route('/get_recipes', methods=['POST'])
def getRecipes():
    #set the api request url
    url = request.form['url']

    #call spoonacular api
    response = requests.get(url)

    #store api response status code
    responseStatus = response.status_code

    #store api response as json
    jsonResponse = response.json()

    #store recipes response from api
    recipes = jsonResponse['results']

    #store total count of recipes
    totalResults = jsonResponse['totalResults']

    #calculate newOffset for next page of data
    newOffset = (jsonResponse['number'] + jsonResponse['offset'])

    #detect if has next page based on newOffset and totalRecipes available
    hasNextPage = newOffset < totalResults

    #replace old offset in url with new offset
    newUrl = re.sub('(offset=\d*)', f'offset={newOffset}', url)

    #set pagination data into dictonary
    paginateData = {
        "total": totalResults,
        "showing_total": newOffset if newOffset <= jsonResponse['totalResults'] else jsonResponse['totalResults'],
        "next_page": newUrl if hasNextPage else False
    }

    #return data as dictionary to js
    return {
        "data": recipes,
        "status": responseStatus,
        "paginateData": paginateData
    }

#route for getting recipe summary
@app.route('/get_recipe_summary', methods=['POST'])
def getRecipeSummary():
    #get the recipe id from the form data
    recipe_id = request.form['recipe_id']

    #set the api request url
    url = spoonacular_api_base_url + f'recipes/{recipe_id}/' + spoonacular_recipe_summary + f'?apiKey={spoonacular_api_key}'
    
    #call spoonacular api
    response = requests.get(url)

    #store api response status code
    responseStatus = response.status_code

    if responseStatus == 402:
        return {
            "message": 'Sorry.. free daily quota from Spoonacular API (150 requests) exceeded, please try again after midnight'
        }

    #store api response as json
    jsonResponse = response.json()

    #store recipes response from api
    summary = jsonResponse['summary']

    return {
        "recipe_summary": summary
    }

#run the app
if __name__ == '__main__':
    app.run(debug=True)