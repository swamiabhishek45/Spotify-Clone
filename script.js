// console.log("Console is working!!");
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Add leading zero if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`https://spotify20-roan.vercel.app//${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">

                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Artist name</div>
                </div>
                <div class="playnow" >
                  <span>Play</span>
                  <img id="playnow" class="invert" src="img/play2.svg" alt="">
                </div>
              </li>`;
  }

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

      // let playnow = document.getElementById("playnow");
      // playnow.src = "img/pause.svg";
      // if(currentSong.paused){

      // add event listener to playnow
      // playnow.addEventListener("click", () => {
      //   console.log("img/play2.svg");
      //   if (currentSong.paused) {
      //     currentSong.play();
      //   } else {
      //     currentSong.pause();
      //     playnow.src = "img/play2.svg";
      //   }
      // });
      // }
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  //   let audio = new Audio( "/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`https://spotify20-roan.vercel.app//songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      // console.log(e.href.split("/").slice(-1)[0]);
      let folder = e.href.split("/").slice(-1)[0];
      // Get the meta data of the folder
      let a = await fetch(
          `https://spotify20-roan.vercel.app/${folder}/info.json`
      );
      let response = await a.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div  class="play">
            

              <img id="pp" src="img/play.svg" alt="">

               </div>
              <img
                src="/songs/${folder}/${response.name}.jpeg"
                height="171px"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      // let pp = document.getElementById("pp");
      // pp.src = "img/pause.svg"
      playMusic(songs[0]);
      if (document.querySelector(".left").style.left != "0%") {
        document.querySelector(".left").style.left = "0%";
      }
    });
  });
}

async function main() {
  // get the list of all songs
  await getSongs(`songs/arj`);
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  // attach an event listener to play, previous and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `
      ${formatTime(currentSong.currentTime)}/
      ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event listener to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //  Add event to volume to mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

  // // add event listener to playnow
  // let playnow = document.getElementById("playnow");
  // playnow.addEventListener("click", () => {
  //   console.log("img/play2.svg");
  //   if (currentSong.paused) {
  //     currentSong.play();
  //     playnow.src = "img/pause.svg";
  //   } else {
  //     currentSong.pause();
  //     playnow.src = "img/play2.svg";
  //   }
  // });
}

main();
