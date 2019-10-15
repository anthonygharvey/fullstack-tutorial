const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  async getAllLaunches() {
    // makes a GET req to https://api.spacexdata.com/v2/launches
    const response = await this.get("launches");
    // this.launchReducer() transforms the response
    return Array.isArray(response)
      ? response.map(launch => this.launcReducer(launch))
      : [];
  }

  // takes a flight number and returns data for a particular launch
  async getLaunchById({ launchId }) {
    const response = await this.get("launches", { flight_number: launchId });
    return this.launcReducer(response[0]);
  }

  // returns several launches based on launch ids
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId }))
    );
  }

  launcReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type
      }
    };
  }
}

module.exports = LaunchAPI;
