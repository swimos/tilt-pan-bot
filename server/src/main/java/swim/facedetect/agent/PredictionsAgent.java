package swim.facedetect.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.ValueLane;
import swim.api.lane.MapLane;
import swim.structure.Value;
import swim.uri.Uri;

public class PredictionsAgent extends AbstractAgent {

  private static final int HISTORY_SIZE = 200;

  @SwimLane("latest")
  protected ValueLane<Value> latest = this.<Value>valueLane()
    .isTransient(true);
  
  @SwimLane("setLatest")
  public CommandLane<Value> setValue = this.<Value>commandLane()
      .onCommand((Value newValue) -> {
        latest.set(newValue);
          // System.out.println("newValue: " + newValue);
      });

  @SwimLane("framenumber")
  protected ValueLane<Integer> framenumber = this.<Integer>valueLane()
    .isTransient(true);
  
  @SwimLane("setFramenumber")
  public CommandLane<Integer> setFramenumber = this.<Integer>commandLane()
      .onCommand((Integer newValue) -> {
        framenumber.set(newValue);
          // System.out.println("newValue: " + newValue);
      });

  @SwimLane("fps")
  protected ValueLane<Float> fps = this.<Float>valueLane()
    .isTransient(true);
  
  @SwimLane("fpsHistory")
  MapLane<Long, Float> fpsHistory = this.<Long, Float>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.fpsHistory.size() > HISTORY_SIZE) {
        this.fpsHistory.remove(this.fpsHistory.getIndex(0).getKey());
      }
    })
    .isTransient(true);

  @SwimLane("setFps")
  public CommandLane<Float> setFps = this.<Float>commandLane()
      .onCommand((Float newValue) -> {
        final long now = System.currentTimeMillis();
        fps.set(newValue);
        fpsHistory.put(now, newValue);
          // System.out.println("newValue: " + newValue);
      });

}
