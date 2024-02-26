let hasNextPage = false;
$(document).ready( () => {

    //init select
    $('.diet-select').select2({
        dropdownParent: $('#inputModal')
    });

    $('.corner-info').hover( (e) => {
        // console.log('ere')
        if($(e.target).hasClass('washovered')){
            $(e.target).removeClass('washovered');
        }
    })

    $('.corner-info').mouseleave( (e) => {
        $(e.target).addClass('washovered');
    })
    
    //when reached bottom of page;
    // console.log(hasReachedBottom())
    
    document.addEventListener('scroll', () => {
        // console.log(hasReachedBottom())
        if(hasReachedBottom()){
            //run ajax call
            if(hasNextPage){
                getRecipes()
            }
            console.log('load more recipes if there is')
        }else{
            //do nothin
        }
    })

    // $('#getRecipesButton').on('click', () => {
    //     url = $('#getRecipesButton').data('url')
    //     getRecipes(url);
    // })
})


function showLoader(){
    console.log('show loader ran')
    $('.loader').show();
}

function hideLoader(){
    console.log('hide loader ran')
    $('.loader').hide();
}

function hasReachedBottom(){
    const scrolledTo = window.scrollY + window.innerHeight
    const pageHeight = document.body.scrollHeight - 1;
    const reachedBottom = pageHeight <= scrolledTo
    return reachedBottom;
}

function getRecipes(){
    showLoader();
    let url = $('#getRecipesUrl').data('url');
    console.log('run getRecipes with url: ', url)
    $.ajax({
        url: `/get_recipes`,
        method: "POST",
        dataType: 'JSON',
        data: {url: url},
        success: function(res){
            console.log(res)
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

            console.log(res.paginateData.next_page);
            if(res.paginateData.next_page){
                $('#getRecipesUrl').data('url', res.paginateData.next_page)
            }else{
                hasNextPage = false;
                // $('#getRecipesButton').remove()
            }
            window.scrollTo(0, document.body.scrollHeight);
            hideLoader();
        },
        error: function(err){
            hideLoader();
            console.log(err)
        }
    })
}