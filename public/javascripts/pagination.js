
const paginate = document.getElementById('paginate');
const $campgroundsContainer = $('#campgrounds-container');
paginate.addEventListener('click', function(e) {
    e.preventDefault();
    fetch(this.href)
        .then(response => response.json())
        .then(data => {
            for(const campground of data.docs) {
                let template = generateCampground(campground);
                $campgroundsContainer.append(template);
            }
            /* The cod above updates the campgrounds object after "View More" is clicked on the index.ejs page.
                 The code below tells the clusterMap.js file that since there is more campgrounds now that have 
                 been loaded, the cluster map needs to show those campgrounds as well. Thus, it brings the 
                 campgrounds object in the clusterMap.js file up to date with the campgrouds object in this file. */
            let { nextPage } = data;
            this.href = this.href.replace(/page=\d+/, `page=${nextPage}`);
            campgrounds.features.push(...data.docs);
            map.getSource('campgrounds').setData(campgrounds); // setData updates campgrounds map.
        })
        .catch(err => console.log('ERROR', err));
})

function generateCampground(campground) {
    let template = 
    `<div class="card mb-3" id="campground-post">
        <div class="row">
            <div class="col-md-4">
                <img class="img-fluid rounded" alt="" src="${ campground.images.length ? campground.images[0].url : 'https://res.cloudinary.com/dct4adnkg/image/upload/v1621641013/YelpCamp/vvnztyuigpf0rfadfppg.jpg'}">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                        <h5 class="card-title">${ campground.title }</h5>
                        <p class="card-text">${ campground.description }</p>
                        <p class="card-text">
                            <small class="text-muted">${ campground.location }</small>
                        </p>
                        <a class="btn btn-primary"
                            href="/campgrounds/${ campground._id }">View ${ campground.title }</a>
                </div>
            </div>
        </div>
    </div>`;
    return template;
}
