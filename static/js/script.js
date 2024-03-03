//by default set hasNextPage as false
let hasNextPage = false;

//run code after document has loaded fully.
$(document).ready( () => {

    //init select plugin (allows for selecting multiple options in a user friendly manner)
    $('.diet-select').select2({
        //dropdownParent added to show select2 inside the modal
        dropdownParent: $('#inputModal')
    });

    //listen to clicks on get recipes button
    $('#getRecipesButton').on('click', () => {

        //if it has more recipes, then load them
        if(hasNextPage){
            getRecipes();
        }
    })

})

//used to show loading spinner
function showLoader(){
    $('.loader').show();
}

//used to hide loading spinner
function hideLoader(){
    $('.loader').hide();
}

//used to run ajax call to flask endpoint which calls spoonacular to get more recipes (without page refresh)
function getRecipes(){

    //show loading spinner
    showLoader();

    //get url
    let url = $('#getRecipesUrl').data('url');

    //run ajax call
    $.ajax({
        url: `/get_recipes`,
        method: "POST",
        dataType: 'JSON',
        data: {url: url},
        success: function(res){
            //get recipes list html tag (where the recipes will be added)
            let recipesList = document.querySelector('.recipes-list')

            //loop through the recipes
            res.data.map( recipe => {

                //create the recipe html 
                let html = `
                    <div class="recipe" style="background-image: url('${recipe.image}')">
                        <div class="title-container fs-5">
                            <span class="title">${recipe.title}</span>
                        </div>
                    </div>
                `
                //add the recipe html to the recipes list
                recipesList.innerHTML += html;
            })

            //update the number of recipes currently showing on screen
            $('#recipes-length').html(res.paginateData.showing_total)

            //check if there is another page of recipes from pagination data
            if(res.paginateData.next_page){

                //set the next pages url to the html element;
                $('#getRecipesUrl').data('url', res.paginateData.next_page)

            }else{
                
                //mark has next page as false
                hasNextPage = false;

                //remove the load more recipesn button (since no next page)
                $('#getRecipesButton').remove()

            }

            //hide loading spinner
            hideLoader();
        },
        error: function(err){
            //hide loading spinner
            hideLoader();
        }
    })
}

//used to run ajax call to flask endpoint which calls spoonacular to get summary of given recipe
function getRecipeSummary(recipe){
    $('#summaryModal').modal('hide');
    showLoader();

    //run ajax call
    $.ajax({
        url: `/get_recipe_summary`,
        method: "POST",
        dataType: 'JSON',
        data: {recipe_id: recipe.id},
        success: function(res){

            $('#recipe-summary').html(res.recipe_summary);
            $('#recipe-title').html(`Summary For ${recipe.title} Recipe`);
            $('#summaryModal').modal('show');

            //hide loading spinner
            hideLoader();
        },
        error: function(err){
            //hide loading spinner
            hideLoader();
        }
    })
}