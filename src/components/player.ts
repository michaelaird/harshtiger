import { UserInfoCard } from "bungie-api-ts/user/interfaces";

export class Player {
    public MembershipId: string
    public Displayname: string

    public Activities: string[] = []

    constructor(userInfo: UserInfoCard) {
        this.MembershipId = userInfo.membershipId;
        this.Displayname = userInfo.displayName;
    }

    public AddActivity(activityId: string): void {
        this.Activities.push(activityId);
    }
}