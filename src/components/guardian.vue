<!-- src/components/Hello.vue -->

<template>
  <b-list-group-item class="d-flex justify-content-between align-items-center">
    <div>
      <h5>{{me.UserInfo.displayName}}</h5>
      <small>{{me.mostRecentActivity| moment("from", "now")}} - {{me.oldestActivity| moment("from", "now")}}</small>
    </div>
    <b-badge variant="primary" pill>{{me.teamActivityIds.length}}</b-badge>
  </b-list-group-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import * as Axios from "axios";

import { ApiGateway } from "../api/gateway";
import { ServerResponse, BungieMembershipType } from "bungie-api-ts/common";
import {
  DestinyProfileResponse,
  DestinyComponentType,
  DestinyHistoricalStatsActivity,
  DestinyHistoricalStatsPeriodGroup
} from "bungie-api-ts/destiny2/interfaces";

import {
  getGroupsForMember,
  GroupsForMemberFilter,
  GroupType,
  getMembersOfGroup
} from "bungie-api-ts/groupv2";
import {
  getProfile,
  //searchDestinyPlayer,
  getActivityHistory,
  getPostGameCarnageReport
} from "bungie-api-ts/destiny2";
import { UserInfoCard } from "bungie-api-ts/user/interfaces";

import { Player } from "./player";
import { ClanMember } from "./ClanMember";

@Component({
  props: ["me"]
})
export default class Gaurdian extends Vue {
  public me!: ClanMember;

  constructor() {
    super();
  }
}
</script>

<style>
.greeting {
  font-size: 20px;
}
</style>