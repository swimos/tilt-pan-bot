package swim.facedetect.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.ValueLane;
import swim.api.lane.MapLane;
import swim.structure.Value;
import swim.uri.Uri;

public class GamePadAgent extends AbstractAgent {

  @SwimLane("latest")
  protected ValueLane<Value> latest = this.<Value>valueLane();
  
  @SwimLane("setLatest")
  public CommandLane<Value> setValue = this.<Value>commandLane()
      .onCommand((Value newValue) -> {
        latest.set(newValue);
          // System.out.println("newValue: " + newValue);
      });
    
}
