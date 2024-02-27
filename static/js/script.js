let hasNextPage = false;
let oldScrolledTo = null;
let oldPageHeight = null;
$(document).ready( () => {

    //init select
    $('.diet-select').select2({
        dropdownParent: $('#inputModal')
    });

    animateButton('.corner-info')
    animateButton('.corner-search')
    

    // $('.corner-info').hover( (e) => {
    //     console.log('ere', e)
    //     if($(e.currentTarget).hasClass('washovered')){
    //         $(e.currentTarget).removeClass('washovered');
    //     }
    // })

    // $('.corner-info').mouseleave( (e) => {
    //     $(e.currentTarget).addClass('washovered');
    // })
    
    //when reached bottom of page;
    // console.log(hasReachedBottom())
    
    // document.addEventListener('scroll', () => {
        // console.log(hasReachedBottom())
        // if(hasReachedBottom()){
        //     //run ajax call
        //     if(hasNextPage){
        //         getRecipes()
        //     }
        //     console.log('load more recipes if there is')
        // }else{
        //     //do nothin
        // }
    // })

    $('#getRecipesButton').on('click', () => {
        if(hasNextPage){
            getRecipes();
        }
        // url = $('#getRecipesUrl').data('url')
    })
})


function showLoader(){
    // console.log('show loader ran')
    $('.loader').show();
}

function hideLoader(){
    // console.log('hide loader ran')
    $('.loader').hide();
}

function hasReachedBottom(){
    // const scrolledTo = window.scrollY + window.innerHeight
    // const pageHeight = $(document).height()
    // console.log(pageHeight, scrolledTo)
    // const reachedBottom = pageHeight <= scrolledTo
    // console.log($(window).scrollTop() + $(window).height())
    // console.log($(document).height());
    if($(window).scrollTop() + $(window).height() >= ($(document).height())){
        reachedBottom = true
    }else{
        reachedBottom = false
    }
    // oldPageHeight = pageHeight;
    // oldScrolledTo = scrolledTo;
    return reachedBottom;
}

function getRecipes(){
    showLoader();
    let url = $('#getRecipesUrl').data('url');
    // console.log('run getRecipes with url: ', url)
    $.ajax({
        url: `/get_recipes`,
        method: "POST",
        dataType: 'JSON',
        data: {url: url},
        success: function(res){
            // console.log(res)
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

            console.log('nextpage', res.paginateData.next_page);
            if(res.paginateData.next_page){
                $('#getRecipesUrl').data('url', res.paginateData.next_page)
            }else{
                hasNextPage = false;
                $('#getRecipesButton').remove()
            }
            // window.scrollTo(0, document.body.scrollHeight);
            hideLoader();
        },
        error: function(err){
            hideLoader();
            console.log('err', err)
        }
    })
}

function animateButton(cls){
    $(`${cls}`).hover( (e) => {
        // console.log('ere', e)
        if($(e.currentTarget).hasClass('washovered')){
            $(e.currentTarget).removeClass('washovered');
        }
    })

    $(`${cls}`).mouseleave( (e) => {
        $(e.currentTarget).addClass('washovered');
    })
}