let hasNextPage = false;
$(document).ready( () => {

    //init select
    $('.diet-select').select2({
        dropdownParent: $('#inputModal')
    });

    animateButton('.corner-info')
    animateButton('.corner-search')
    
    $('#getRecipesButton').on('click', () => {
        if(hasNextPage){
            getRecipes();
        }
    })
})


function showLoader(){
    $('.loader').show();
}

function hideLoader(){
    $('.loader').hide();
}

function getRecipes(){
    showLoader();
    let url = $('#getRecipesUrl').data('url');
    $.ajax({
        url: `/get_recipes`,
        method: "POST",
        dataType: 'JSON',
        data: {url: url},
        success: function(res){
            let recipesList = document.querySelector('.recipes-list')
            res.data.map( recipe => {
                let html = `
                    <div class="recipe" style="background-image: url('${recipe.image}')">
                        <div class="title-container fs-5">
                            <span class="title">${recipe.title}</span>
                        </div>
                    </div>
                `
                recipesList.innerHTML += html;
            })
            $('#recipes-length').html(res.paginateData.showing_total)

            if(res.paginateData.next_page){
                $('#getRecipesUrl').data('url', res.paginateData.next_page)
            }else{
                hasNextPage = false;
                $('#getRecipesButton').remove()
            }

            hideLoader();
        },
        error: function(err){
            hideLoader();
        }
    })
}

function animateButton(cls){
    $(`${cls}`).hover( (e) => {
        if($(e.currentTarget).hasClass('washovered')){
            $(e.currentTarget).removeClass('washovered');
        }
    })

    $(`${cls}`).mouseleave( (e) => {
        $(e.currentTarget).addClass('washovered');
    })
}