console.log('lets write javascript');

let currentSong = new Audio();

let songs;

let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }


    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]

    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>  <img class="invert" src="assets/music.svg" alt="">
              <div class="info">
                <div>  ${song.replaceAll("%20", " ")}</div>
                <div>VARAD</div>
              </div>
              <div class="playnow">     
                <span>Play Now</span>           
                <img class="invert" src="assets/play.svg" alt="">
              </div>
                                          </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00/00.00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess") ) {
            let folder = e.href.split("/").slice(-2)[1]

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" width="55px" height="55px" fill="none" viewbox="0 0 24 24"
            class="size-6">
                <!-- Outer Circle with Bright Shiny Green -->
                <circle cx="12" cy="12" r="9" fill="#3CFF7E" />
                <!-- Play Icon with Black Fill -->
                <path
                  d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  fill="black" />
                  </svg>
                  
                  </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`
        }
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            console.log("fetching songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}


async function main() {


    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //display all the albums on th page
    displayAlbums()

    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        } else {
            currentSong.pause()
            play.src = "assets/play.svg"
        }


    })


    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("previousclicked");
        console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("nextclicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("assets/mutee.svg","assets/volumee.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e.target)
        if (e.target.src.includes("assets/volumee.svg")) {
            e.target.src = e.target.src.replace("assets/volumee.svg","assets/mutee.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }else{
            e.target.src = e.target.src.replace("assets/mutee.svg","assets/volumee.svg")
            currentSong.volume =.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })


}
main()