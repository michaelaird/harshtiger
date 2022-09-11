import { UserInfoCard } from "bungie-api-ts/user/interfaces";
import { BungieMembershipType } from "bungie-api-ts/common";
import { getProfile, getActivityHistory } from "bungie-api-ts/destiny2/api";
import { ApiGateway } from "../api/gateway";
import { DestinyComponentType, DestinyHistoricalStatsActivity, DestinyHistoricalStatsPeriodGroup } from "bungie-api-ts/destiny2";

export class ClanMember {
  public MembershipId: string
  private _membershipType: BungieMembershipType

  teamActivityIds: string[] = [];

  mostRecentActivity?: Date = undefined;
  oldestActivity?: Date = undefined;

  history: DestinyHistoricalStatsPeriodGroup[] = [];
  


  private constructor(public UserInfo: UserInfoCard, private joinDate: Date) {
    this.MembershipId = UserInfo.membershipId;
    this._membershipType = UserInfo.membershipType;
  }


  public static async LoadClanMember(userInfo: UserInfoCard, joinDate: Date) {
    const newMember = new ClanMember(userInfo, joinDate);

    await newMember.GetGuardian();

    return newMember;
  }


  private async GetGuardian() {
    const profileResponse = await getProfile(ApiGateway.$http, {
      /**
       * A comma separated list of components to return (as strings or numeric values).
       * See the DestinyComponentType enum for valid components to request. You must
       * request at least one component to receive results.
       */
      components: [DestinyComponentType.Profiles],
      /** Destiny membership ID. */
      destinyMembershipId: this.UserInfo.membershipId,
      /** A valid non-BungieNet membership type. */
      membershipType: this.UserInfo.membershipType
    });

    //console.log(profileResponse);

    const characterIds: string[] = profileResponse.Response.profile.data!
      .characterIds;
    
    const all = Promise.all(
      characterIds.map(async characterId => {
        await this.loadCharacter(characterId);
      })
    );

    await all;
  }

  private async loadCharacter(id: string)
  {
    var page = 0;
      var loadMore: boolean = true;

      while (loadMore) {
        try {
          const historyResponse = await getActivityHistory(ApiGateway.$http, {
            /** The id of the character to retrieve. */
            characterId: id,
            /** Number of rows to return */
            count: 200,
            /** The Destiny membershipId of the user to retrieve. */
            destinyMembershipId: this.MembershipId,
            /** A valid non-BungieNet membership type. */
            membershipType: this._membershipType,
            page: page++
          });

          if (
            Object.keys(historyResponse.Response).length === 0 &&
            historyResponse.Response.constructor === Object
          ) {
            loadMore = false;
          } else {
            const activities = historyResponse.Response.activities
              .map(activity => {
                return {
                  instanceId: activity.activityDetails.instanceId,
                  activityDate: new Date(activity.period),
                  item: activity
                }
              })
              .filter(activity => {
                return activity.activityDate > this.joinDate;
              });

              if (activities.length == 0)
              {
                loadMore = false;
              }
              else
              {

              
              activities.forEach(activity => {

                this.history.push(activity.item);

                if (
                  this.mostRecentActivity === undefined ||
                  activity.activityDate > this.mostRecentActivity
                ) {
                  this.mostRecentActivity = activity.activityDate;
                }

                if (
                  this.oldestActivity === undefined ||
                  activity.activityDate < this.oldestActivity
                ) {
                  this.oldestActivity = activity.activityDate;
                }

                //if (activity.values.playerCount.basic.value > 1) {
                this.teamActivityIds.push(activity.instanceId);
                //}
              })
              ;
            }
          }
        }
        catch (error) {
          loadMore = false;
        }
      }
  }
}