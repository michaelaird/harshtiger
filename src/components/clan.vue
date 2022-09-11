<!-- src/components/Hello.vue -->

<template>
  <div>
    <b-container>
       <b-row v-if="clanDetails != null" >
        <b-col>
          <b-card :title="clanDetails.name" :sub-title="clanDetails.motto" overlay :img-src="'http://bungie.net' + clanDetails.bannerPath" text-variant="white">

          <b-progress  v-if="(totalClan > 0 && ClanMembers.length < totalClan)" :value="(ClanMembers.length / totalClan)*100" variant="success" show-value striped animated></b-progress>

          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <graph v-bind:ClanMembers="ClanMembers"></graph>
        </b-col>
        <b-col>
          <b-list-group v-for="item in ClanMembers" v-bind:key="item.MembershipId">
            <guardian v-bind:me="item" />
          </b-list-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import * as Axios from "axios";

import * as d3 from "d3";

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
  getMembersOfGroup,
  GroupV2
} from "bungie-api-ts/groupv2";
import {
  getProfile,
//  searchDestinyPlayer,
  getActivityHistory,
  getPostGameCarnageReport
} from "bungie-api-ts/destiny2";
import { UserInfoCard } from "bungie-api-ts/user/interfaces";
import { searchByGlobalNamePrefix } from "bungie-api-ts/user"

import guardian from "./guardian.vue";
import Graph from "./graph.vue";

import { ClanMember } from "./ClanMember";
import { ChordGroup } from "d3";

@Component({
  props: ["name"],
  components: { guardian, Graph }
})
export default class Clan extends Vue {
  name!: string;


  public clanDetails: GroupV2 | null = null;
  public ClanMembers: ClanMember[] = [];

  public totalClan: number = 0;

  constructor() {
    super();
  }

  @Watch("name")
  public async onGuardianChanged(newValue: string, oldValue: string) {
    if (newValue == "") {
      return;
    }

    this.name = newValue;
    this.totalClan = 0;
    this.ClanMembers = [];
    this.clanDetails = null;

    // const searchResponse = await searchDestinyPlayer(ApiGateway.$http, {
    //   displayName: this.name,
    //   /** A valid non-BungieNet membership type, or All. */
    //   membershipType: BungieMembershipType.All
    // });

    const searchResponse = await searchByGlobalNamePrefix(ApiGateway.$http, {
      displayNamePrefix: this.name,
      page: 0
    })

    const baseMembershipId = searchResponse.Response.searchResults[0].destinyMemberships[0].membershipId;

    const clanResponse = await getGroupsForMember(ApiGateway.$http, {
      /** Filter apply to list of joined groups. */
      filter: GroupsForMemberFilter.All,
      /** Type of group the supplied member founded. */
      groupType: GroupType.Clan,
      /** Membership ID to for which to find founded groups. */
      membershipId: baseMembershipId,
      /** Membership type of the supplied membership ID. */
      membershipType: searchResponse.Response.searchResults[0].destinyMemberships[0].membershipType
    });

    

    
    this.clanDetails = clanResponse.Response.results[0].group
    const clanId = this.clanDetails.groupId;

    var page: number = 1;
    var hasMore: boolean = true;

    let clanList: UserInfoCard[] = [];

    let monthAgo: Date = new Date(
      new Date().setDate(new Date().getDate() - 30)
    );

    while (hasMore) {
      const memberResponse = await getMembersOfGroup(ApiGateway.$http, {
        /** Page number (starting with 1). Each page has a fixed size of 100 items per page. */
        currentpage: page++,
        /** The ID of the group. */
        groupId: clanId
      });

      const response = memberResponse.Response;

      this.totalClan += response.results.length;

      response.results.map(async member => {
        const joinedDate = new Date(member.joinDate);

        const clanMate: ClanMember = await ClanMember.LoadClanMember(
          member.destinyUserInfo,
          monthAgo < joinedDate ? joinedDate : monthAgo
        );
        this.ClanMembers.push(clanMate);
      });

      hasMore = response.hasMore;
    }
  }
}
</script>

<style>
.greeting {
  font-size: 20px;
}
</style>