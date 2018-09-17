<template>
  <div id="photo">
    <div id="album_breadcrumb" class="album index">
    </div>
    <div class="album overlay">
      <div class="ui container album">
        <div id="album_list" class="ui three column grid">
          <div
            class="column album"
            v-for="(year, index) in yearList"
            v-if="state === 'year'"
            :class="{ 'left' : index % 3 === 0, 'center' : index % 3 === 1, 'right' : index % 3 === 2 }"
            @click="showAlbum(year.year)"
          >
            <div class="ui fluid card">
              <div
                id="card_preview"
                class="image"
                :style="{'background-image': 'url(\'' + getYearImage(year) +'\')'}"
              ></div>
              <div id="cardContent" class="content">
                <div class="header">{{year.year}}</div>
                <div
                  class="meta"
                  v-if="year.eventNumber > 1 && year.photoNumber > 1"
                >
                  {{year.eventNumber}} Event<span v-if="year.eventNumber > 1">s</span>,
                  {{year.photoNumber}} Photo<span v-if="year.photoNumber > 1">s</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="column album"
            v-for="(album, index) in albumList"
            v-if="state === 'album'"
            :class="{'left' : index % 3 === 0, 'center' : index % 3 === 1, 'right' : index % 3 === 2}"
            @click="showPhotos(album)">
            <div class="ui fluid card">
              <i
                id="albumRemoveIcon"
                class="remove icon"
                v-if="isSPARCS"
                @click="showDeleteConfirmModal($event, album)"
              ></i>
              <div
                id="card_preview"
                class="image"
                :style="{'background-image': 'url(\'' + getAlbumImage(album) +'\')'}"
              ></div>
              <div id="cardContent" class="content">
                <div class="header">{{album.title}}</div>
                <div class="meta">{{album.date}}</div>
              </div>
            </div>
          </div>
          <div
            class="column album"
            v-for="(photo, index) in photoList"
            v-if="state === 'photo'"
            :class="{'left' : index % 3 === 0, 'center' : index % 3 === 1, 'right' : index % 3 === 2}"
            @click="showImage(photo, index)"
          >
            <div class="ui fluid card">
              <i
                id="albumRemoveIcon"
                class="remove icon"
                v-if="isSPARCS"
                @click="showDeleteConfirmModal($event, photo)"
              ></i>
              <div
                id="card_preview"
                class="image"
                :style="{'background-image': 'url(\'' + photo +'\')'}"
              ></div>
            </div>
          </div>

        </div>
      </div>

      <div
        class="ui"
        id="photoDetail"
        @click="hideImage"
        style="text-align: center;"
      >
        <div id="photoDetailBG">
          <i
            id="photoDetailIconLeft"
            class="angle large left icon"
            @click="previousImage"
          ></i>
          <img
            id="photoDetailImage"
            class="ui middle aligned image"
            :src="selectedPhoto.s"
          />
          <i
            id="photoDetailIconRight"
            class="angle large right icon"
            @click="nextImage"
          ></i>
        </div>
      </div>
    </div>

    <div id="addNewPhoto" class="ui modal" style="min-width: 680px;">
      <i class="close icon"></i>
      <div class="header">
        Share your wonderful memory in SPARCS
      </div>
      <div class="content">
        <form id="newPhotoForm" class="ui form">
          <div class="field">
            <label>연도 </label>
            <div id="yearDropdown" class="ui fluid search selection dropdown">
              <input id="yearDropdownInput" type="hidden" name="year">
              <i class="dropdown icon"></i>
              <div id="yearText" class="default text">Select Year</div>
              <div class="menu">
                <div
                  class="item"
                  v-for="(year, index) in yearData"
                  :data-value="year.year"
                >
                  {{year}}
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label>앨범 <i class="add icon" @click="showAddAlbumModal()"></i></label>
            <div id="albumDropdown" class="ui fluid search selection dropdown">
              <input type="hidden" name="album">
              <i class="dropdown icon"></i>
              <div id="albumText" class="default text">Select Album</div>
              <div class="menu">
                <div
                  class="item"
                  v-for="(albumTitle, index) in uploadAlbumList"
                  :data-value="albumTitle"
                >
                  {{albumTitle}}
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label>사진 첨부 </label>
            <div class="ui file input action">
              <input type="text" v-bind:value="uploadPhotoTitle" name="image" readonly>
              <input
                multiple
                type="file"
                id="photoUpload"
                ref="fileUploads"
                @change="onFileChangePhoto($event)"
                style="display: none"
              >
              <div class="ui button" @click="onSelectFileClick"> 파일 선택</div>
            </div>
          </div>
        </form>
      </div>
      <div class="actions" style="clear: both;">
        <div class="ui black button deny">Cancel</div>
        <div class="ui positive right labeled icon button approve" @click="uploadImage">
          Upload <i class="checkmark icon"></i>
        </div>
      </div>
    </div>
    <div id="addAlbumModal" class="ui small modal">
      <div class="header">
        Add New Album <i class="close icon" style="float: right; cursor: pointer; cursor: hand;"
                         @click="hideNewAlbumModal"></i>
      </div>
      <div class="content">
        <form id="newAlbumForm" class="ui form">
          <div id="newAlbumDiv" class="field">
            <label>새 앨범 이름 </label>
            <input id="newAlbumName" type="text" name="newalbum" placeholder="New Album Name">
          </div>
          <div class="ui error message"></div>
        </form>
      </div>
      <div class="actions">
        <div class="ui black button" @click="hideNewAlbumModal">Cancel</div>
        <div class="ui positive right labeled icon black primary button" @click="addNewAlbum">
          Add <i class="checkmark icon"></i>
        </div>
      </div>
    </div>
    <div id="deleteConfirmModal" class="ui basic modal">
      <div class="ui icon header">
        <i class="archive icon"></i>
        Deleting Your Memory in SPARCS..
      </div>
      <div class="content">
        <p>Are you really sure that you want to delete all these wonderful and precious memories in SPARCS?</p>
      </div>
      <div class="actions">
        <div class="ui red basic cancel inverted button">
          <i class="remove icon"></i>
          No
        </div>
        <div class="ui green ok inverted button" @click="deleteConfirm">
          <i class="checkmark icon"></i>
          Yes
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import {apiEndpoint, getSession} from '../utils';

  const d = new Date();
  const defaultImage = `${apiEndpoint}/static/test1.jpg`

  Array.range = (a, b, step) => {
    const A = [a];
    const realStep = step || 1;
    let realA = a;
    while (realA + realStep >= b) {
      realA += realStep;
      A.push(realA);
    }
    return A;
  };


  export default {
    name: 'Album',
    data: () => ({
      photo: {photo_src: './../../static/test1.jpg', photo_info: '2017 겨울'},
      photo2: {photo_src: './../../static/test2.jpg', photo_info: '2016 여름'},
      state: 'year',
      yearList: [],
      yearData: [],
      albumList: [],
      photoList: [],
      albumRawList: [],
      breadcrumb: [],
      uploadYear: '',
      uploadAlbum: '',
      uploadAlbumList: [],
      uploadPhotoTitle: '',
      uploadPhoto: '',
      selectedPhoto: '',
      deleteObject: '',
    }),
    ready: () => {
    },
    mounted() {
      $.fn.form.settings.rules.redundant = (value) => {
        if (value === '') {
          return true;
        }
        return !this.uploadAlbumList.includes(value);
      };

      document.getElementById('album').classList.add('active');
      $('#yearDropdown').dropdown({
        onShow: () => {
          $('#yearDropdown').dropdown('restore defaults');
        },
        onChange: (year) => {
          // custom action
          this.uploadYear = year;
          this.uploadAlbumList = [];
          this.newAlbumList = [];
          $('#albumDropdown').popup('destroy');
          for (let i = 0; i < this.albumRawList.length; i += 1) {
            if (this.albumRawList[i].year === parseInt(year, 10)) {
              this.uploadAlbumList.push(this.albumRawList[i].title);
            }
          }
          this.uploadAlbum = '';
          $('#albumDropdown').dropdown('restore defaults');
        },
      });
      $('#newPhotoForm').form(
        {
          fields: {
            year: 'empty',
            album: 'empty',
            image: 'empty',
          },
          onInvalid: () => {
            console.log('onInvalid');
            return false;
          },
          onSuccess: (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
        },
      );
      $('#newAlbumForm').form(
        {
          fields: {
            newalbum: {
              rules: [
                {
                  type: 'empty',
                  prompt: '{name}을 정해주세요!',
                },
                {
                  type: 'redundant',
                  prompt: '{name}이 이미 존재합니다!',
                },
              ],
            },
          },
          onInvalid: () => {
            console.log(`redundant[${this.uploadAlbumList}]`);
            console.log('onInvalid');
            return false;
          },
          onSuccess: (event) => {
            event.preventDefault();
            event.stopPropagation();
            return true;
          },
        },
      );
      // window.onresize = () => {
      //   const width = $(window).width();
      //   const diff = 1280 - width;
      //   const cols = document.getElementsByClassName('yellow rectangle');
      //   for (let i = 0; i < cols.length; i += 1) {
      //     const w = 219 - (diff / 5);
      //     cols[i].style.width = `${w} + px`;
      //     console.log(cols[i].clientWidth);
      //   }
      //   const images = document.getElementsByClassName('image');
      //   for (let i = 0; i < images.length; i += 1) {
      //     images[i].style.height = images[i].style.clientWidth;
      //     console.log(images[i].style.clientHeight);
      //   }
      // }
      this.$nextTick(() => {
        window.addEventListener('resize', this.checkWindowSize);
      });
      $('#albumDropdown').dropdown({
        onChange: (value) => {
          // custom action
          this.uploadAlbum = value;
        },
      });
      axios.get(`${apiEndpoint}/album/getAlbum`)
        .then((response) => {
          const {years, albums} = response.data;
          this.yearList = this.deepcopy(years);
          this.yearList = this.yearList.sort((a, b) => b.year - a.year);
          this.albumRawList = this.deepcopy(albums);
          this.fixBreadCrumb();
        })
        .catch((error) => {
          console.log(error);
        });
      this.yearData = Array.range(d.getFullYear(), 1970, -1);
      // we gave marginTop of r_view when righ menu item is clicked, so reload doesn't take this action
      const width = $(window).width();
      if (width <= 600) {
        document.getElementById('r_view').style.marginTop = '49px';
      } else {
        document.getElementById('r_view').style.marginTop = '85px';
      }
      document.getElementById('menu_header').style.backgroundColor = 'rgba(0,0,0,1)';
    },
    computed: {
      isSPARCS() {
        const a = getSession('isSPARCS');
        return a || false;
      },
    },
    updated() {
      this.checkWindowSize();
    },


    methods: {
      filterAlbum(year, callback) {
        this.albumList = [];
        for (let i = 0; i < this.albumRawList.length; i += 1) {
          if (parseInt(this.albumRawList[i].year, 10) === year) {
            this.albumList.push(this.deepcopy(this.albumRawList[i]));
          }
        }
        callback();
      },
      checkWindowSize() {
        let width = $(window).width();
        console.log(width);
        if (width <= 600) {
          width = 600;
          document.getElementById('r_view').style.marginTop = '49px';
          $('#newAlbum').hide();
          $('.meta').hide();
        } else {
          document.getElementById('r_view').style.marginTop = '85px';
          $('#newAlbum').show();
          $('.meta').show();
        }
        const diff = 1280 - width;
        const w = 219 - (diff / 5);
        $('.yellow.rectangle').css('width', w);
        $('.image').css('height', $('#card_preview').width());
      },
      fitImageHeight() {
      },
      showDeleteConfirmModal(event, obj) {
        console.log(event);
        console.log(obj);
        this.deleteObject = obj;
        $('#deleteConfirmModal').modal('show');
        event.stopPropagation();
      },
      showAddAlbumModal() {
        $('#newAlbumName').val('');
        if (this.uploadYear === '') {
          $('#albumDropdown').attr('data-html', 'set year first!');
          $('#albumDropdown').popup('destroy');
          $('#albumDropdown').popup('show');
          return;
        }
        console.log('wtf');
        $('#addAlbumModal').show();
      },
      hideNewAlbumModal() {
        $('#addAlbumModal').hide();
      },
      addNewAlbum() {
        console.log('addNewAlbum');
        $('#newAlbumForm').submit();
        const newAlbumName = $('#newAlbumName').val();
        if (newAlbumName === '' || this.uploadAlbumList.includes(newAlbumName)) {
          return;
        }
        $('#newAlbumDiv').popup('destroy');
        const dateList = d.toString().split(' ');
        const monthChar = dateList[1];
        const month = d.getMonth() + 1;
        const day = dateList[2];
        const year = dateList[3];
        const albumD = `${monthChar} ${day}, ${year}`;
        let albumDR = `${year}-${month}-${day}`;
        if (day < 10 && month >= 10) {
          albumDR = `${year}-${month}-0${day}`;
        } else if (day >= 10 && month < 10) {
          albumDR = `${year}-0${month}-${day}`;
        } else {
          albumDR = `${year}-0${month}-0${day}`;
        }
        const sendJson =
          {
            year: this.uploadYear,
            albumTitle: newAlbumName,
            albumDate: albumD,
            albumDateRaw: albumDR,
          };
        console.log(sendJson);
        axios.post(`${apiEndpoint}/album/newAlbum`, sendJson)
          .then((response) => {
            const data = response.data;
            if (data.success) {
              this.albumRawList.push(data.resultAlbum);
              this.uploadAlbumList.push(data.resultAlbum.title);
              this.setYearList(data.resultYear);
              $('#addAlbumModal').hide();
              if (this.breadcrumb.length >= 1) {
                this.filterAlbum(this.breadcrumb[0], () => {
                });
              }
            } else {
              console.log(data);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      fixBreadCrumb() {
        const len = this.breadcrumb.length;
        const albumBreadcrumb = document.getElementById('album_breadcrumb');
        console.log(albumBreadcrumb);
        const bcYellowRec = document.createElement('div');
        const bcYellowTri = document.createElement('div');
        const bcGreyRec = document.createElement('div');
        const bcGreyTri = document.createElement('div');
        const uiWrapper = document.createElement('div');
        const uiBreadcrumb = document.createElement('div');
        const bcSection1 = document.createElement('a');
        const bcDivider = document.createElement('i');
        const bcSection2 = document.createElement('a');
        let uploadButton = '';

        console.log(`bc is sparcs ${this.isSPARCS}`);

        albumBreadcrumb.innerHTML = '';
        if (this.isSPARCS) {
          console.log('heyhey');
          uploadButton = document.createElement('button');
          uploadButton.classList.add('ui', 'red', 'attached', 'button', 'album');
          uploadButton.id = 'newAlbum';
          uploadButton.addEventListener('click', () => {
            this.showUploadModal();
          });
          uploadButton.innerHTML = 'Upload';
          albumBreadcrumb.appendChild(uploadButton);
        }

        bcYellowRec.classList.add('yellow', 'rectangle');
        bcYellowTri.classList.add('yellow', 'triangle');
        bcYellowRec.innerHTML = 'Album';
        bcYellowRec.addEventListener('click', () => {
          this.breadcrumb = [];
          this.state = 'year';
          this.hideImage();
          albumBreadcrumb.innerHTML = '';
          albumBreadcrumb.appendChild(bcYellowRec);
          albumBreadcrumb.appendChild(bcYellowTri);
          albumBreadcrumb.appendChild(uploadButton);
          if (this.isSPARCS) {
            albumBreadcrumb.appendChild(uploadButton);
          }
        });
        albumBreadcrumb.appendChild(bcYellowRec);
        albumBreadcrumb.appendChild(bcYellowTri);

        if (len > 0) {
          bcGreyRec.classList.add('grey', 'rectangle');
          bcGreyTri.classList.add('grey', 'triangle');
          bcGreyRec.innerHTML = this.breadcrumb[0];
          bcGreyRec.addEventListener('click', () => {
            const year = this.breadcrumb[0];
            this.hideImage();
            this.breadcrumb = this.breadcrumb.slice(0, 0);
            this.showAlbum(year);
          });
          albumBreadcrumb.appendChild(bcGreyRec);
          albumBreadcrumb.appendChild(bcGreyTri);
        }

        if (len > 1) {
          uiWrapper.id = 'ui_breadcrumb';
          uiBreadcrumb.classList.add('ui', 'huge', 'breadcrumb', 'album');
          bcSection1.classList.add('section', 'album');
          bcSection1.innerHTML = this.breadcrumb[1].title;
          bcSection1.addEventListener('click', () => {
            const album = this.breadcrumb[1];
            this.hideImage();
            this.breadcrumb = this.breadcrumb.slice(0, 1);
            this.showPhotos(album);
          });
          albumBreadcrumb.appendChild(uiBreadcrumb);
          uiBreadcrumb.appendChild(uiWrapper);
          uiWrapper.appendChild(bcSection1);
        }

        if (len > 2) {
          bcDivider.classList.add('right', 'chevron', 'icon', 'divider', 'album');
          bcSection2.classList.add('section', 'album');
          bcSection2.innerHTML = this.breadcrumb[2];
          uiWrapper.appendChild(bcDivider);
          uiWrapper.appendChild(bcSection2);
        }
        this.checkWindowSize();
      },
      deepcopy(obj) {
        if (obj) return JSON.parse(JSON.stringify(obj));
        return {};
      },
      showUploadModal() {
        this.uploadYear = '';
        this.uploadPhoto = '';
        this.uploadPhotoTitle = '';
        this.uploadAlbumList = [];
        this.uploadAlbum = '';
        const albumText = document.getElementById('albumText');
        albumText.classList.add('default');
        albumText.innerHTML = 'Select Album';
        const yearText = document.getElementById('yearText');
        yearText.classList.add('default');
        yearText.innerHTML = 'Select Year';
        $('#addNewPhoto').modal({
          onHide: () => {
            this.hideNewAlbumModal();
          },
          onApprove: () => {
            $('#newPhotoForm').submit();
            return false;
          },
        }).modal('show');
      },
      showImage(src, index) {
        this.selectedPhoto = {ind: index, s: src};
        $('#photoDetail').show();
      },
      hideImage() {
        $('#photoDetail').hide();
      },
      previousImage(event) {
        const index = this.selectedPhoto.ind;
        if (index > 0) {
          this.selectedPhoto = {ind: index - 1, s: this.photoList[index - 1]}
        }
        event.stopPropagation();
      },
      nextImage(event) {
        const index = this.selectedPhoto.ind;
        if (index < this.photoList.length - 1) {
          this.selectedPhoto = {ind: index + 1, s: this.photoList[index + 1]}
        }
        event.stopPropagation();
      },
      getYearImage(year) {
        let photo = defaultImage;
        for (let i = 0; i < this.albumRawList.length; i += 1) {
          const album = this.albumRawList[i];
          if (album.year === year.year && album.photos.length > 0) {
            photo = album.photos[0];
          }
        }
        return photo;
      },
      getAlbumImage(album) {
        let photo = defaultImage;
        if (album.photos.length > 0) {
          photo = album.photos[0];
        }
        return photo;
      },
      showAlbum(year) {
        this.breadcrumb.push(year);
        this.filterAlbum(year, () => {
          this.state = 'album';
        });
        this.fixBreadCrumb();
      },
      deleteConfirm() {
        if (this.state === 'album') {
          this.deleteAlbum(this.deleteObject);
        } else {
          this.deletePhoto(this.deleteObject);
        }
      },
      deleteAlbum(album) {
        const sendJson = {year: album.year, albumTitle: album.title}
        axios.post(`${apiEndpoint}/album/removeAlbum`, sendJson)
          .then((response) => {
            const data = response.data;
            if (data.success) {
              this.setYearList(data.result1);
              for (let i = 0; i < this.albumRawList.length; i += 1) {
                const albumIter = this.albumRawList[i];
                if (albumIter.year === album.year && albumIter.title === album.title) {
                  console.log(i);
                  this.albumRawList.splice(i, 1);
                  break;
                }
              }
              if (this.breadcrumb.length >= 1) {
                this.filterAlbum(this.breadcrumb[0], () => {
                });
              }
            } else {
              console.log(data);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      showPhotos(album) {
        let albumIter = '';
        this.state = 'photo';
        for (let k = 0; k < this.albumRawList.length; k += 1) {
          albumIter = this.albumRawList[k];
          if (albumIter.year === album.year && albumIter.title === album.title) {
            break;
          }
        }
        this.breadcrumb.push(albumIter);
        this.photoList = [];
        for (let i = 0; i < albumIter.photos.length; i += 1) {
          this.photoList.push(this.deepcopy(albumIter.photos[i]));
        }
        this.fixBreadCrumb();
      },
      deletePhoto(photo) {
        const album = this.breadcrumb[1];
        const sendJson = {year: album.year, albumTitle: album.title, photoURL: photo}
        axios.post(`${apiEndpoint}/album/removePhoto`, sendJson)
          .then((response) => {
            const data = response.data;
            if (data.success) {
              this.setYearList(data.result0);
              this.setAlbumList(data.result1);
              if (this.breadcrumb.length >= 1) {
                this.filterAlbum(this.breadcrumb[0], () => {
                });
              }
            } else {
              console.log(data);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      addPhoto(src, title, date) {
        this.photolist.push(this.photo);

        const albumList = document.getElementById('album_list');
        const albumColumn = document.createElement('div');
        const albumImage = document.createElement('img');
        const albumTitle = document.createElement('div');
        const albumDate = document.createElement('div');
        const imageSource = './../../static/test1.jpg';

        albumColumn.classList.add('column');
        albumImage.classList.add('ui', 'centered', 'image');
        albumImage.src = imageSource;
        albumImage.onclick = function () {
          this.showImage(imageSource);
        };
        albumTitle.classList.add('title');
        albumTitle.innerHTML += title;
        albumDate.classList.add('date');
        albumDate.innerHTML += date;

        albumList.appendChild(albumColumn);
        albumColumn.appendChild(albumImage);
        albumColumn.appendChild(albumTitle);
        albumColumn.appendChild(albumDate);
      },
      onSelectFileClick() {
        this.$refs.fileUploads.accept = 'image/*';
        this.$refs.fileUploads.click();
      },
      onFileChangePhoto(e) {
        const files = e.target.files || e.dataTransfer.files;
        console.log(files);
        if (!files.length) return;
        this.uploadPhotoTitle = files[0].name;
        if (files.length > 1) {
          this.uploadPhotoTitle += ` 외 ${files.length - 1}개`;
        }
        this.createImage(files);
      },
      setYearList(newYear) {
        const year = newYear.year;
        for (let v = 0; v < this.yearList.length; v += 1) {
          if (this.yearList[v].year === year) {
            if (newYear.eventNumber === 0) {
              this.yearList.splice(v, 1);
            } else {
              this.yearList[v].eventNumber = newYear.eventNumber;
              this.yearList[v].photoNumber = newYear.photoNumber;
            }
            return;
          }
        }
        this.yearList.push(this.deepcopy(newYear));
      },
      setAlbumList(newAlbum) {
        const year = newAlbum.year;
        const title = newAlbum.title;
        let success = false;
        for (let v = 0; v < this.albumRawList.length; v += 1) {
          if (this.albumRawList[v].year === year && this.albumRawList[v].title === title) {
            this.albumRawList[v].photoNumber = newAlbum.photoNumber;
            this.albumRawList[v].photos = newAlbum.photos;
            success = true;
            break;
          }
        }
        if (!success) {
          this.albumRawList.push(this.deepcopy(newAlbum));
        }
        if (this.breadcrumb.length >= 2) {
          const currentAlbum = this.breadcrumb[1];
          this.breadcrumb = this.breadcrumb.slice(0, 1);
          console.log(currentAlbum);
          console.log(this.breadcrumb);
          this.showPhotos(currentAlbum);
        }
      },
      uploadImage() {
        if (this.uploadYear === '' || this.uploadAlbum === '' || this.uploadPhoto === '') {
          return;
        }
        const dateList = d.toString().split(' ');
        const monthChar = dateList[1];
        const day = dateList[2];
        const year = dateList[3];
        const albumD = `${monthChar} ${day}, ${year}`;
        let albumDirectory = '';
        for (let i = 0; i < this.albumRawList.length; i += 1) {
          if (this.albumRawList[i].year === parseInt(this.uploadYear, 10) &&
            this.albumRawList[i].title === this.uploadAlbum) {
            albumDirectory = this.albumRawList[i].folderName;
            break;
          }
        }
        const sendJson =
          {
            year: this.uploadYear,
            album: this.uploadAlbum,
            albumDate: albumD,
            albumName: albumDirectory,
            photoList: this.uploadPhoto
          };
        console.log(sendJson);
        console.log('letsss');
        axios.post(`${apiEndpoint}/album/upload`, sendJson)
          .then((response) => {
            console.log('letsss');
            const data = response.data;
            console.log(data.success);
            if (data.success) {
              console.log(data);
              this.setYearList(data.result1);
              this.setAlbumList(data.result2);
              if (this.breadcrumb.length >= 1) {
                this.filterAlbum(this.breadcrumb[0], () => {
                });
              }
              $('#addNewPhoto').modal('hide');
            } else {
              console.log('failed');
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      readFile(files, index, fl) {
        const reader = new FileReader();
        if (index >= files.length) return;
        const file = files[index];
        const self = this.readFile;
        reader.onload = function (e) {
          // get file content
          fl.push(e.target.result);
          self(files, index + 1, fl);
        }
        reader.readAsDataURL(file);
      },
      createImage(files) {
        this.uploadPhoto = [];
        this.readFile(files, 0, this.uploadPhoto);
      },
    },
  };
</script>

<style>
  #photo {
    text-align: center;
  }

  .album.overlay {
    position: relative;
    min-height: 500px;
  }

  .ui.popup {
    padding-left: 15px !important;
    z-index: 3500;
  }

  .button.album {
    height: 100%;
    display: inline-block;
    float: right;
  }

  .breadcrumb.album {
    text-align: center;
    padding-left: 10px;
  }

  .ui.dimmer.modals.page {
    z-index: 3500 !important;
  }

  #ui_breadcrumb {
    height: 48px;
    line-height: 48px;
  }

  #album_list {
    padding-top: 3em;
    padding-bottom: 3em;
  }

  #addAlbumModal {
    z-index: 4000;
    top: 40% !important;
  }

  #newAlbum {
  }

  .album.index {
    position: fixed;
    text-align: left;
    height: 48px;
    width: 100%;
    background-color: black;
    color: white;
    z-index: 1250;
  }

  .divider.album {
    color: white !important;
  }

  .section.album {
    color: white !important;
  }

  .preview {
    width: 350px;
    height: 350px;
    background-size: 100% 100%;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    z-index: 0px !important;
  }

  .container.album {
    margin-top: 62px;
  }

  .ui.centered.medium.image.album {
    min-width: 100%;
    max-width: 100%;
  }

  .header {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  #card_preview {
    width: 100%;
    height: 300px;
    background-image: url('./../../static/test2.jpg');
    background-size: 100% 100%;
  }

  .yellow.rectangle {
    width: 219px;
    height: 48px;
    background-color: #f6a623;
    display: inline-block;
    float: left;
    text-align: right;
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    line-height: 48px;
    padding-right: 10px;
    cursor: pointer;
  }

  .yellow.triangle {
    width: 0;
    height: 0;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 20px solid #f6a623;
    z-index: 1001;
    display: inline-block;
    float: left;
    position: relative;
  }

  .grey.rectangle {
    width: 93px;
    height: 48px;
    margin-left: -20px;
    background-color: #9b9b9b;
    display: inline-block;
    float: left;
    text-align: right;
    font-size: 20px;
    font-weight: bold;
    color: #2d3e51;
    line-height: 48px;
    z-index: 100;
    position: relative;
    padding-right: 10px;
    cursor: pointer;
  }

  .grey.triangle {
    width: 0;
    height: 0;
    border-top: 24px solid transparent;
    border-bottom: 24px solid transparent;
    border-left: 20px solid #9b9b9b;
    display: inline-block;
    float: left;
  }

  #photoDetailIconLeft {
    display: inline-block;
    z-index: 1300;
    position: absolute;
    color: #ffffff;
    top: 50%;
    left: 0%;
    font-size: 3em;
    margin-left: 20px;
    transform: translate(-50%, -50%);
  }

  #photoDetailIconRight {
    display: inline-block;
    z-index: 1300;
    position: absolute;
    color: #ffffff;
    top: 50%;
    right: -2%;
    margin-right: 0;
    font-size: 3em;
    transform: translate(-50%, -50%);
  }

  #photoDetailBG {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    display: inline-block;
  }

  #photoDetail {
    display: none;
    width: 100%;
    height: calc(100vh - 133px);
    margin-top: 133px;
    text-align: center;
    top: 0;
    left: 0;
    z-index: 1600;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.85);
  }

  #albumRemoveIcon {
    position: absolute;
    top: 0;
    right: 0;
    color: #ffffff;
    z-index: 1240;
  }

  @media (min-width: 600px) {
    .column.album {
      padding-top: 0 !important;
    }

    .left {
      padding-left: 0 !important;
      padding-right: 18px !important;
    }

    .center {
      padding-left: 9px !important;
      padding-right: 9px !important;
    }

    .right {
      padding-left: 18px !important;
      padding-right: 0 !important;
    }

    .year.event {
      padding-top: 5px;
      font-size: 15px;
      text-align: left;
      font-weight: 500;
    }

    .title {
      padding-top: 10px;
      text-align: left;
      font-size: 25px;
      font-weight: bold;
    }

    #photoDetailImage {
      display: inline-block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 30%;
      max-height: 80%;
      width: 70% !important;
      height: auto !important;
      text-align: center;
    }

  }

  @media (max-width: 600px) {
    .column.album {
      padding-top: 0 !important;
      padding-bottom: 2px !important;
    }

    .ui[class*="three column"].grid > .column:not(.row), .ui[class*="three column"].grid > .row > .column {
      width: 33.33333333%;
      height: 33.3333333% !important;
    }

    .left {
      padding-left: 0 !important;
      padding-right: 2px !important;
    }

    .center {
      padding-left: 1px !important;
      padding-right: 1px !important;
    }

    .right {
      padding-left: 2px !important;
      padding-right: 0 !important;
    }

    .year.event {
      display: none;
    }

    .title {
      padding-top: 5px;
      text-align: left;
      font-size: 20px;
      font-weight: bold;
      position: absolute;
      top: 71%;
      left: 0;
      width: 90%;
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 10px;
    }

    #photoDetailImage {
      display: inline-block;
      position: relative;
      top: 50%;
      left: 35%;
      transform: translate(-50%, -50%);
      width: 70% !important;
      height: auto !important;
      max-height: 80%;
      max-width: 80%;
      text-align: center;
    }

    #photoDetailIconRight {
      display: inline-block;
      z-index: 1300;
      position: absolute;
      color: #ffffff;
      top: 50%;
      right: -6%;
      margin-right: 0;
      font-size: 3em;
      transform: translate(-50%, -50%);
    }

    #cardContent {
      padding: 0.8em !important;
    }
  }

  @media (max-width: 435px) {
    .title {
      padding-top: 5px;
      text-align: left;
      font-size: 17px;
      font-weight: bold;
      position: absolute;
      top: 73%;
      left: 0;
      width: 90%;
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 5px 5px;
    }

    #photoDetailIconRight {
      display: inline-block;
      z-index: 1300;
      position: absolute;
      color: #ffffff;
      top: 50%;
      right: -8%;
      margin-right: 0;
      font-size: 3em;
      transform: translate(-50%, -50%);
    }

    #cardContent {
      padding: 0.6em !important;
    }
  }

  @media (max-width: 350px) {
    .title {
      padding-top: 5px;
      text-align: left;
      font-size: 17px;
      font-weight: bold;
      position: absolute;
      top: 71%;
      left: 0;
      width: 90%;
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 5px 5px;
    }

    #photoDetailIconRight {
      display: inline-block;
      z-index: 1300;
      position: absolute;
      color: #ffffff;
      top: 50%;
      right: -10%;
      margin-right: 0;
      font-size: 3em;
      transform: translate(-50%, -50%);
    }
  }


</style>
