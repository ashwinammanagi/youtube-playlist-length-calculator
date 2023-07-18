<template>
  <div id="app" class="container">
    
    <a href="/" style="text-decoration:none; color: #dbdbdb;"><h1>{{ title }}</h1></a>
    <Divider />
    
    <form class="full-width-form" @submit.prevent="calculateLength">
      <div class="input-container">
        <InputText
          class="full-width-input"
          autofocus
          type="text"
          placeholder="Paste YouTube Playlist Link Here"
          v-model="youtubePlaylistId"
          :class="{'p-invalid': invalidLink !== '' && youtubePlaylistId !== ''}"
        />
        <Button label="Submit" 
          class="full-width-submit" 
          @click="calculateLength" 
          v-if="isLinkInvalid != true" 
          icon="pi pi-arrow-right"
          iconPos="right"
        /> 
      </div>
      <InlineMessage 
        class="full-width-inlineMessage" 
        severity="error" 
        v-if="invalidLink != '' && youtubePlaylistId != ''">
          {{ invalidLink }}
      </InlineMessage>
    </form>

    <div class="slider-container">
      <div class="p-card p-d-flex p-justify-center" style="padding: 1rem; border: 0.09rem solid #304562; border-radius: 0.5rem;">
        <p style="color: #a2a6ac">Playback Speed: {{ playbackSpeed }}x <i class="pi pi-forward"></i></p>
        <Slider type="range" v-model="playbackSpeed" :min="0.25" :max="2" :step="0.05" />
      </div>
    </div>


    <div class="playlist-items" v-if="response && response.data && response.data.video_list !== 'Invalid link'">
      <h3 style="color: #dbdbdb;">Playlist Duration: {{ formatDuration(adjustedDuration) }} <i class="pi pi-clock"></i></h3>
      <p style="color: #dbdbdb;">Total Videos: {{ response.data.video_list.length }} <i class="pi pi-hashtag"></i></p>
      <Divider />
      <div class="card-container">
        <div v-for="video in response.data.video_list" :key="video.snippet.title" class="card">
          <a :href="'https://www.youtube.com/watch?v=' + video.snippet.resourceId.videoId" style="text-decoration:none">
            <Card style="border: 0.09rem solid #304562; border-radius: 0.5rem;">
              <template #header>
                <img alt="Thumbnail" :src="video.snippet.thumbnails.medium.url" style="border: 0.09rem solid #304562; border-radius: 0.5rem;" />
              </template>
              <template #content><p>{{ video.snippet.position + 1 }}. {{ video.snippet.title }}</p></template>
            </Card>
          </a>
        </div>
      </div>
    </div>

 
    <ScrollTop />
  </div>
</template>

<script>
import axios from 'axios'
import '@/assets/styles.css';


export default {
  data() {
    return {
      title: 'YouTube Playlist Length Calculator',
      youtubePlaylistId: '',
      playbackSpeed: 1,
      response: '',
      adjustedDuration: 0,
      invalidLink: '',
    }
  },

  watch: {
    youtubePlaylistId: function(newLink) {
      this.validateLink(newLink);
    },

    playbackSpeed: function(newSpeed) {
      if (this.response) {
        this.adjustedDuration = this.response.data['duration'] / newSpeed;
      }
    },
  },

  computed: {
    isLinkInvalid() {
      return !this.extractPlaylistId(this.youtubePlaylistId);
    },
  },

  methods: {
    async calculateLength() {
      const extractedPlaylistId = this.extractPlaylistId(this.youtubePlaylistId);

      const apiUrl = `https://06r3ffbbpc.execute-api.us-east-1.amazonaws.com/youtubePlaylistLengthCalculator`;
      const response = await axios.post(apiUrl, {
        youtubePlaylistId: extractedPlaylistId,
      });

      console.log(response.data);

      if (response.data.video_list == 'Invalid link') {
        this.invalidLink = 'Invalid YouTube playlist link';
      } else {
        this.response = response;
        this.adjustedDuration = response.data['duration'] / this.playbackSpeed;
      }
    },

    extractPlaylistId(link) {
      const regex = /[?&]list=([^&#]*)/;
      const match = regex.exec(link);
      return match && match[1];
    },

    validateLink(link) {
      const extractedPlaylistId = this.extractPlaylistId(link);
      this.invalidLink = extractedPlaylistId ? '' : 'Invalid YouTube playlist link';
    },

    formatDuration(durationInSeconds) {
      const days = Math.floor(durationInSeconds / 86400);
      const hours = Math.floor((durationInSeconds % 86400) / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = Math.floor(durationInSeconds % 60);

      let formattedDuration = '';
      if (days > 0) formattedDuration += `${days}d `;
      if (hours > 0) formattedDuration += `${hours}h `;
      if (minutes > 0) formattedDuration += `${minutes}m `;
      formattedDuration += `${seconds}s`;

      return formattedDuration;
    },
  },
}
</script>