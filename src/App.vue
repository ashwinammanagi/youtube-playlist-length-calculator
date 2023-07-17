<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <form @submit.prevent="calculateLength">
      <input type="text" placeholder="youtube.com/playlist?list=ID" v-model="youtubePlaylistId">
      <button type="button" @click="calculateLength" :disabled="isLinkInvalid">SUBMIT</button>
      <p>{{ invalidLink }}</p>
    </form>

    <div>
      <span>Playback Speed: {{ playbackSpeed }}x</span>
      <br>
      <input type="range" v-model="playbackSpeed" min="0.25" max="2" step="0.25">
    </div>

    <div v-if="response && response.data && response.data.video_list !== 'Invalid link'">
      <h2>Playlist duration: {{ formatDuration(adjustedDuration) }}</h2>
      <ul>
        <li v-for="video in response.data.video_list" :key="video.snippet.title">
          <a :href="'https://www.youtube.com/watch?v=' + video.snippet.resourceId.videoId">
            <img :src="video.snippet.thumbnails.high.url" alt="Thumbnail">
            <p>Title: {{ video.snippet.title }}</p>
          </a>
        </li>
      </ul>
    </div>


  </div>
</template>

<script>
import axios from 'axios'

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

<style>
#app {
  text-align: center;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
</style>