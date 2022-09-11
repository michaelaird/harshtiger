<template>
  <div>
      <b-form inline>
          <label class="sr-only" for="inline-form-input-name">Name</label>
          <b-input
      id="inline-form-input-name"
      class="mb-2 mr-sm-2 mb-sm-0"
      placeholder=""
      v-model.trim="guardian" 
    ></b-input>
    <b-button variant="primary" v-on:click="loadClan">Load</b-button>
      </b-form>
    <clan-component v-bind:name="guardianInternal"  />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import ClanComponent from "./clan.vue";

@Component({
  components: { ClanComponent }
})
export default class Root extends Vue {

    guardian: string = '';

    guardianInternal: string = '';

    loadClan()
    {
        this.guardianInternal = this.guardian;
    }
}
</script>