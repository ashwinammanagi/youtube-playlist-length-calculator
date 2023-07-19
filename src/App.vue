<template>
  <div id="app" class="container">
 
    <a href="/" style="text-decoration:none; color: #dbdbdb;"><h1 style="font-size: large;">{{ title }}</h1></a>
    
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
        <Button
          label="Submit"
          class="full-width-submit"
          @click="calculateLength"
          v-if="isLinkInvalid != true"
          :disabled="isSubmitting"
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
        <Slider type="range" v-model="playbackSpeed" :min="0.25" :max="2" :step="0.05" aria-label="playback speed slider" />
      </div>
    </div>


    <div class="playlist-items" v-if="response && response.data && response.data.video_list !== 'Invalid link'">
      <h3 style="color: #dbdbdb;">Playlist Duration: {{ formatDuration(adjustedDuration) }} <i class="pi pi-clock"></i></h3>
      <p style="color: #dbdbdb;">
        {{ response.data.maxed === 'maxed'
          ? 'Total number of videos limited to: ' + response.data.video_list.length
          : 'Total videos: ' + response.data.video_list.length }}
      </p>

      <Divider />
      <div class="card-container">
        <div v-for="video in response.data.video_list" :key="video.snippet.title" class="card">
          <a :href="'https://www.youtube.com/watch?v=' + video.snippet.resourceId.videoId" style="text-decoration:none">
            <Card style="border: 0.09rem solid #304562; border-radius: 0.5rem;">
              <template #header>
                <img alt="Thumbnail" :src="video.snippet.thumbnails && video.snippet.thumbnails.medium ? video.snippet.thumbnails.medium.url : require('@/assets/images/video-not-found.png')" style="border: 0.09rem solid #304562; border-radius: 0.5rem; width: 320px;" />
              </template>
              <template #content><p>{{ video.snippet.position + 1 }}. {{ video.snippet.title }}</p></template>
            </Card>
          </a>
        </div>
      </div>
    </div>

    <div class="accordion-table" v-else>
      <Divider />
      <div style="margin-top: 1rem; text-align: left;">
      <p style="color: #a2a6a9; text-align: center;">FAQs</p>
        <Accordion >
            <AccordionTab header="What is YouTube Playlist Length Calculator?">
                <p>
                  YouTube Playlist Length Calculator allows you to calculate the total duration of YouTube playlist. Paste the playlist link above to calculate the length. Current limitation allows maximum videos of 200 in the playlist.
                </p>
            </AccordionTab>
            <AccordionTab header="How to adjust the playback speed for calculating the playlist duration?">
                <p>
                    Use the slider to change the playback speed. The duration will be calculated as per your desired playback setting.
                </p>
            </AccordionTab>
            <AccordionTab header="What are the features?">
                <p>
                    You can find out the total duration, total number of videos and display all the videos in the playlist with the video thumbnail and link.
                </p>
            </AccordionTab>
        </Accordion>
      </div>
    </div>

    <footer class="footer">
      <p><small>&copy; 2023 <a href="https://iash.dev" target="_blank" style="color: #a2a6a9;">Ashwin Ammanagi</a>. All rights reserved.</small></p>      
    </footer>

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
      isSubmitting: false,
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
      if (this.isSubmitting) return; // Prevent multiple submissions
      this.isSubmitting = true;
      
      try {
        const extractedPlaylistId = this.extractPlaylistId(this.youtubePlaylistId);

        const apiUrl = 'https://06r3ffbbpc.execute-api.us-east-1.amazonaws.com/youtubePlaylistLengthCalculator';
        const response = await axios.post(apiUrl, {
          youtubePlaylistId: extractedPlaylistId,
        });

        console.log(response.data);

        if (response.data.video_list === 'Invalid link') {
          this.invalidLink = 'Invalid YouTube playlist link';
        } else {
          this.response = response;
          this.adjustedDuration = response.data['duration'] / this.playbackSpeed;
        }
      } catch (error) {
        console.error('An error occurred while fetching playlist data:', error);
        // Optionally, you can handle specific error types differently
        if (error.response && error.response.status === 404) {
          this.invalidLink = 'YouTube playlist not found';
        } else {
          this.invalidLink = 'Error fetching playlist data';
        }
      } finally {
        this.isSubmitting = false;
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