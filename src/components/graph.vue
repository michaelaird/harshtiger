<!-- src/components/Hello.vue -->

<template>
  <div id="graph"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import * as d3 from "d3";

import { ClanMember } from "./ClanMember";
import { ChordGroup } from "d3";

@Component({
  props: ["ClanMembers"]
  //components: { guardian }
})
export default class Graph extends Vue {
  public ClanMembers!: ClanMember[];

  private svg!: d3.Selection<any, any, any, any>;

  constructor() {
    super();
  }

  mounted() {
    this.svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", 900)
      .attr("height", 900)
      .append("g")
      .attr("transform", "translate(450,450)");
  }

  @Watch("ClanMembers")
  public onPropertChanged(value: ClanMember[], newValue: ClanMember[]): void {
    d3.selectAll("svg > g > *").remove();



    const clanMates = newValue
      .slice() //get a copy
      // .sort((c1, c2) =>
      //   c1.UserInfo.displayName.localeCompare(c2.UserInfo.displayName)
      // )
      ;

    const guardianIndexMap: Map<string, number> = new Map<string, number>();
    const indexGuardianMap: Map<number, string> = new Map<number, string>();

    const matrix: number[][] = [];

    for (let index = 0; index < clanMates.length; index++) {
      guardianIndexMap.set(clanMates[index].MembershipId, index);
      indexGuardianMap.set(index, clanMates[index].MembershipId);

      matrix[index] = [];
    }

  let foundItemsInCommon = false;
  let maxInteractions = 0;

    for (const [index, guardianId] of indexGuardianMap) {
      const sourceGuardian = clanMates.filter(
        c => c.MembershipId == guardianId
      )[0];

      matrix[index][index] = 0;

      for (
        let compareIndex = index + 1;
        compareIndex < clanMates.length;
        compareIndex++
      ) {
        const compareGuardianId = indexGuardianMap.get(compareIndex);

        const compareGuardian = clanMates.filter(
          c => c.MembershipId == compareGuardianId
        )[0];

        const activitiesInCommon = this.Intersect(
          sourceGuardian.teamActivityIds,
          compareGuardian.teamActivityIds
        ).length;

        if (activitiesInCommon > maxInteractions)
        {
          maxInteractions = activitiesInCommon;
        }

        matrix[index][compareIndex] = activitiesInCommon;
        matrix[compareIndex][index] = activitiesInCommon;

        if (activitiesInCommon> 0)
        {
          foundItemsInCommon = true;
        }
      }
    }

  if (!foundItemsInCommon)
  {
    return; //nothing to graph
  }

    var res = d3
      .chord()
      .padAngle(0.025) // padding between entities (black arc)
      .sortChords(d3.descending)
      .sortGroups(d3.descending)
      .sortSubgroups(d3.descending)(matrix);

    let arcGenerator = d3
      .arc<any, any>()
      .innerRadius(350)
      .outerRadius(360);

    // add the groups on the inner part of the circle
    this.svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) {
        return d.groups;
      })
      .enter()
      .append("g")
      .append("path")
      .style("fill", "grey")
      .style("stroke", "black")
      .attr("d", arcGenerator);
      // .on("mouseover", this.fade(0.1)) /* Where attempt at mouseover is made */
      // .on("mouseout", this.fade(1));

    let ribbonGenerator = d3.ribbon<any, any>().radius(350);

    let maxUnique = this.Pair(clanMates.length + 1, clanMates.length + 1);

    // Add the links between groups
    this.svg
      .datum(res)
      .append("g")
      .attr("class", "chord")
      .selectAll("path")
      .data(function(d) {
        return d;
      })
      .enter()
      .append("path")
      .attr("d", ribbonGenerator)
      .style("fill", (d, i) =>
      {
        console.log ("pair" +  this.Pair(d.source.index + 1, d.target.index + 1));
        return d3.interpolateInferno(
          this.Pair(d.source.index + 1, d.target.index + 1) / maxUnique
        )
        // d3.interpolateRainbow(
        //   (d.source.index+d.target.index) / (2 * this.ClanMembers.length)
        // )
      });
    //.style("stroke", "black");

    // draw everyone' name
    var g = this.svg
      .selectAll("g.group")
      .data(res.groups)
      .enter()
      .append("svg:g")
      .attr("class", "group");
    // .on("mouseover", mouseover)
    // .on("mouseout", function(d) {
    //     d3.select("#tooltip").style("visibility", "hidden")
    // });

    g.append("svg:text")
      .each((d: any) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .style("font-family", "helvetica, arial, sans-serif")
      .style("font-size", "10px")
      .attr("text-anchor", (d: any) => {
        return d.angle > Math.PI ? "end" : null;
      })
      .attr("transform", (d: any) => {
        return (
          "rotate(" +
          ((d.angle * 180) / Math.PI - 90) +
          ")" +
          "translate(" +
          (360 + 15) +
          ")" +
          (d.angle > Math.PI ? "rotate(180)" : "")
        );
      })
      .text((d: any, index: number) => {
        return clanMates[index].UserInfo.displayName;
      });
  }

  private Intersect<T>(array1: T[], array2: T[]): T[] {
    var result = array1.filter(n => {
      return array2.indexOf(n) > -1;
    });
    return result;
  }

  private fade(opacity: number): (d: d3.ChordGroup, i: number) => void {
    return (d: d3.ChordGroup, i: number) => {
      this.svg
        .selectAll("g.chord path")
        .filter((d: any) => {
          return d.source.index != i && d.target.index != i;
        })
        .raise()
        .transition()
        .style("opacity", opacity);
    };
  }

  private Pair(x: number, y: number): number {
    if (x < y) {
      return x * (y - 1) + (y - x - 2) ** 2 / 4;
    } else {
      return (x - 1) * y + (x - y - 2) ** 2 / 4;
    }
  }
}
</script>

<style>
.greeting {
  font-size: 20px;
}
</style>