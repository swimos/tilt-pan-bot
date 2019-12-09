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

  @SwimLane("tilt")
    protected ValueLane<Integer> tilt = this.<Integer>valueLane().isTransient(true);

  @SwimLane("setTilt")
  public CommandLane<Integer> setTilt = this.<Integer>commandLane()
      .onCommand((Integer newValue) -> {
        if(newValue != tilt.get()) {
          tilt.set(newValue);
        }
      });        

  @SwimLane("pan")
  protected ValueLane<Integer> pan = this.<Integer>valueLane().isTransient(true);

  @SwimLane("setPan")
  public CommandLane<Integer> setPan = this.<Integer>commandLane()
      .onCommand((Integer newValue) -> {
        if(newValue != pan.get()) {
          pan.set(newValue);
        }
      });        
  
}
