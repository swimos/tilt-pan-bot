package swim.facedetect.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.ValueLane;
import swim.api.lane.MapLane;
import swim.structure.Value;
import swim.uri.Uri;

public class RobotStateAgent extends AbstractAgent {

  @SwimLane("ledMode")
  protected ValueLane<String> ledMode = this.<String>valueLane().isTransient(true);

  @SwimLane("setLedMode")
  public CommandLane<String> setLedMode = this.<String>commandLane()
      .onCommand((String newValue) -> {
        ledMode.set(newValue);
      });  

  @SwimLane("mood")
  protected ValueLane<String> mood = this.<String>valueLane().isTransient(true);

  @SwimLane("setMood")
  public CommandLane<String> setMood = this.<String>commandLane()
      .onCommand((String newValue) -> {
        mood.set(newValue);
      });  

}
