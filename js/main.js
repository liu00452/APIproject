let myCode = (function () {
    /*globals APIKEY*/
    const movieDataBaseURL =
        "https://api.themoviedb.org/3/";
    let imageURL = null;
    let imageSizes = [];
    let imageURLKey = "imageURL";
    let imageSizesKey = "imageSizes";
    let timeKey = "timeKey";
    let modeKey = "modeKey";
    let staleDataTimeOut = 3600;
    let searchString = "";

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        //console.log(APIKEY);
        addEventlisteners();
        getDataFormLocalStorage();

    }

    function addEventlisteners() {
        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13) {
                startSearch();
            }
        });
        document.querySelector(".searchButtonDiv").addEventListener("click", startSearch);
        document.querySelector(".modeButtonDiv").addEventListener("click", showOverly);

        document.querySelector(".cancel-btn").addEventListener("click", hideOverly);

        document.querySelector(".save-btn").addEventListener("click", function (e) {
            let List = document.getElementsByName("preference");
            let Type = null;
            for (let i = 0; i < List.length; i++) {
                if (List[i].checked) {
                    Type = List[i].value;
                    break;
                }
            }

            if (Type == "tv") {
                document.querySelector("header h1").textContent = `TV Recommendations`;
                document.querySelector(".image3").classList.add("hide");
                document.querySelector(".image2").classList.remove("hide");


            } else {
                document.querySelector(".image3").classList.remove("hide");
                document.querySelector(".image2").classList.add("hide");

                document.querySelector("header h1").textContent = `Movie Recommendations`;
            }

            localStorage.setItem(modeKey, JSON.stringify(Type));

            hideOverly(e);
        });


        let searchButton = document.querySelector(".searchButtonDiv");
        searchButton.addEventListener("click", startSearch);
    }

    function showOverly(e) {
        e.preventDefault();
        let overlay = document.querySelector(".overlay");
        overlay.classList.add("show");
        overlay.classList.remove("hide");
        showModal(e);
    }

    function hideOverly(e) {
        e.preventDefault();
        e.stopPropagation();
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("show");
        overlay.classList.add("hide");
        hideModal(e);
    }

    function showModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("off");
        modal.classList.add("on");
    }

    function hideModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.add("off");
        modal.classList.remove("on");
    }

    function getDataFormLocalStorage() {

        if (localStorage.getItem(imageURLKey) && localStorage.getItem(imageSizesKey) && localStorage.getItem(timeKey)) {

            let savedDate = localStorage.getItem(timeKey);
            savedDate = new Date(savedDate);

            let seconds = calculateElapsedTime(savedDate);

            if (seconds > staleDataTimeOut) {
                getPosterURLAndSizes();
            }

        } else {
            getPosterURLAndSizes();
        }
    }

    function calculateElapsedTime(savedDate) {
        let now = new Date();
        let elapsedTime = now.getTime() - savedDate.getTime();

        let seconds = Math.ceil(elapsedTime / 1000);

        return seconds;
    }

    function getPosterURLAndSizes() {

        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

        console.log(url);

        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);

                imageURL = data.images.secure_base_url;
                imageSizes = data.images.poster_sizes;

                console.log(imageURL);
                console.log(imageSizes);

                localStorage.setItem(imageURLKey, JSON.stringify(imageURL));
                localStorage.setItem(imageSizesKey, JSON.stringify(imageSizes));

                let now = new Date();

                localStorage.setItem(timeKey, now);

            })
            .catch(function (error) {
                console.log(error);
            })
    }

    function startSearch() {
        document.querySelector(".image1").classList.add("hide");
        document.querySelector(".image3").classList.add("hide");

        console.log("start search");
        searchString = document.getElementById("search-input").value;
        if (!searchString) {
            alert("Please enter search data");
            document.getElementById("search-input").focus();
            return;
        } else {

            let Header = document.querySelector(".firstpage");

            document.querySelector("header> img").classList.add("hide");
            
            Header.classList.remove("first");
            Header.classList.add("change");


            getSearchResults();
        }

    }

    function getSearchResults() {

        searchString = document.getElementById("search-input").value;

        let Type = JSON.parse(localStorage.getItem(modeKey));

        let url = `${movieDataBaseURL}search/${Type}?api_key=${APIKEY}&query=${searchString}`;

        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                console.log(data);

                let content = document.querySelector("#search-results>.content");
                content.innerHTML = "";
                let cards = [];
                for (let i = 0; i < data.results.length; i++) {
                    let movie = data.results[i];
                    cards.push(createMovieCard(movie));

                }

                let documentFragment = new DocumentFragment();

                cards.forEach(function (item) {
                    documentFragment.appendChild(item);
                });

                content.appendChild(documentFragment);


                let cardList = document.querySelectorAll(".content>div");

                cardList.forEach(function (item) {
                    item.addEventListener("click", getRecommendations);
                });

            })
            .catch(error => console.log(error));
    }

    function createMovieCard(movie) {
        let documentFragment = new DocumentFragment();

        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let Title = document.createElement("p1");
        let Date = document.createElement("p2");
        let Rating = document.createElement("p3");
        let Overview = document.createElement("p4");

        let Type = JSON.parse(localStorage.getItem(modeKey));

        if (Type == "tv") {
            Title.textContent = movie.name;
            Date.textContent = movie.first_air_date;
            image.setAttribute("alt", movie.name);
        } else {
            Title.textContent = movie.title;
            Date.textContent = movie.release_date;
            image.setAttribute("alt", movie.title);
        }

        imageSizes = JSON.parse(localStorage.getItem(imageSizesKey))[2];
        imageURL = JSON.parse(localStorage.getItem(imageURLKey));


        Rating.textContent = movie.vote_average;
        Overview.textContent = movie.overview;
        image.src = `${imageURL}${imageSizes}${movie.poster_path}`;

        movieCard.setAttribute("data-title", movie.title);
        movieCard.setAttribute("data-id", movie.id);

        movieCard.className = "movieCard";
        section.className = "imageSection";
        Title.className = "title";

        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(Title);
        movieCard.appendChild(Date);
        movieCard.appendChild(Rating);
        movieCard.appendChild(Overview);

        documentFragment.appendChild(movieCard);

        return documentFragment;
    }

    function getRecommendations() {

        document.querySelector("#search-results").classList.add("hide");

        let movieTitle = this.getAttribute("data-title");
        let movieID = this.getAttribute("data-id");

        let Type = JSON.parse(localStorage.getItem(modeKey));

        document.getElementById("search-input").value = movieTitle;

        let url = `https://api.themoviedb.org/3/${Type}/${movieID}/recommendations?api_key=${APIKEY}&language=en-US&page=1`

        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                console.log(data);

                let content = document.querySelector("#recommend-results>.content");
                content.innerHTML = "";

                let cards = [];
                for (let i = 0; i < data.results.length; i++) {
                    let movie = data.results[i];
                    cards.push(createMovieCard(movie));

                }

                let documentFragment = new DocumentFragment();

                cards.forEach(function (item) {
                    documentFragment.appendChild(item);
                });

                content.appendChild(documentFragment);


                let cardList = document.querySelectorAll(".content>div");

                cardList.forEach(function (item) {
                    item.addEventListener("click", getRecommendations);
                });

            })
            .catch(error => console.log(error));

    }
})();
