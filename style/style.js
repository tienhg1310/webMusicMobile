const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'f8-player';
const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const progress = $('#progress');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name: "Chiếc Khăn Piêu",
        singer: "Tùng Dương",
        path: './asset/mp3/chiếc khăn piêu.mp3',
        image: './asset/img/tungduong.jpg'
    },
    {
        name: "LALISA",
        singer: "LISA",
        path: "./asset/mp3/lalisa.mp3",
        image: "./asset/img/LISA.jpg"
    },
    {
        name: "Người lạ ơi",
        singer: "KARIK",
        path: "./asset/mp3/Người lạ ơi.mp3",
        image: "./asset/img/karik.jpg"
    },
    {
        name: "Gửi anh xa nhớ",
        singer: "Bích Phương",
        path: "./asset/mp3/gửi anh xa nhớ.mp3",
        image: "./asset/img/bichphuong.jpg"
    },
    {
        name: "The Night",
        singer: "AVICII",
        path: "./asset/mp3/theNight.mp3",
        image: "./asset/img/AVC.jpg"
    },

    ],
    // render playlist
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''} " data-index = "${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    // lắng nghe scroll
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xu li cd quay va dung 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // xu li phong to thu nho cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;


            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // xu li khi click play button

        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }


        // khi audio play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // khi audio pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // tiến độ bài hát thay đổi 
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // xu li khi tua bai hat 
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;

        }

        // khi next bai hat 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();

            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong();
        }

        // khi prev bai hat 
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.preSong();

            }
            audio.play();
            _this.render()  
        }
        // khi random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);

        }
        // repeat bai hat
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // audio ended
        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play();
            }else {
            nextBtn.click();
            }
        }
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || !e.target.closest('.option')){
                // xu li khi click vao song
                if (songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // xu li khi click vao song option
            };
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                 behavior: 'smooth',
                 block: 'nearest'
            })
        },500)
    },

    loadCurrentSong: function () {


        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
       this.isRandom = this.config.isRandom;
       this.isRandom = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    preSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        this.loadConfig();
        // dinh nghia thuoc tinh cho obj
        this.defineProperties();

        // lang nghe xu li su kien
        this.handleEvent()
        // tai thong tin bai hat dau vao UI 
        this.loadCurrentSong()
        // render
        this.render()
    }
}

app.start();