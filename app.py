from flask import Flask, render_template, request
import requests
import json
import re

app = Flask(__name__)
spoonacular_api_base_url = 'https://api.spoonacular.com/'
spoonacular_complex_search_endpoint = 'recipes/complexSearch'
spoonacular_api_key = '5a83ebe6c5d744a9938a06ee1ab8a8ac'

#diets file
with open('diets.json') as dietJsonFile:
    diets = json.load(dietJsonFile)

#intolerance
with open('intolerances.json') as intoleranceJsonFile:
    intoleranceOptions = json.load(intoleranceJsonFile)

#recipes file (temporary)
# with open('recipes.json') as recipeJsonFile:
#     recipes = json.load(recipeJsonFile)
    


@app.route('/', methods=['POST', 'GET'])
def index():

    if request.method == 'POST':
        diet = request.form.getlist('diet[]')
        intoleranceList = request.form.getlist('intolerance[]')
        intoleranceString = ','.join(intoleranceList)
        dietString = ','.join(diet)
        query = request.form['query']
        url = spoonacular_api_base_url + spoonacular_complex_search_endpoint + f'?apiKey={spoonacular_api_key}'

        #add get params
        if query:
            url += f'&query={query}'

        if diet:
            url += f'&diet={dietString}'

        if intoleranceString:
            url += f'&intolerance={intoleranceString}'

        #run api call here;
        response = requests.get(url)
        responseStatus = response.status_code
        jsonResponse = response.json()
        recipes = jsonResponse['results']
        totalResults = jsonResponse['totalResults']
        newOffset = (jsonResponse['number'] + jsonResponse['offset'])
        hasNextPage = newOffset < totalResults
    
        paginateData = {
            "total": totalResults,
            "next_page": f'{url}&offset={newOffset}' if hasNextPage else False
        }
        #if number + offset is < totalResults, then there is a next_url
        print(paginateData)
        
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
        diet = request.args.get('diet[]')
        if diet is None:
            diet = []

        intoleranceList = request.args.get('intolerance[]')
        if intoleranceList is None:
            intoleranceList = []

        query = request.args.get('query')


    return render_template(
        'index.html',
        diet=diet,
        intoleranceList=intoleranceList,
        diets=diets,
        recipes=[],
        query=query,
        intoleranceOptions=intoleranceOptions
    )


@app.route('/get_recipes', methods=['POST'])
def getRecipes():

    url = request.form['url']
    response = requests.get(url)
    responseStatus = response.status_code
    jsonResponse = response.json()
    recipes = jsonResponse['results']
    totalResults = jsonResponse['totalResults']
    newOffset = (jsonResponse['number'] + jsonResponse['offset'])
    hasNextPage = newOffset < totalResults
    newUrl = re.sub('(offset=\d*)', f'offset={newOffset}', url)
    print(newUrl)

    paginateData = {
        "total": totalResults,
        "next_page": newUrl if hasNextPage else False
    }

    return {
        "data": recipes,
        "status": responseStatus,
        "paginateData": paginateData
    }


if __name__ == '__main__':
    app.run(debug=True)