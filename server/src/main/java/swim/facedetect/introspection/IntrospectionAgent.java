// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.facedetect.introspection;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.ValueLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
// import swim.reflect.model.MeshStats;
import swim.reflect.model.MeshStats;
import swim.structure.Record;
import swim.structure.Value;

public class IntrospectionAgent extends AbstractAgent {

  @SwimLane("totalMessage")
  public ValueLane<Long> totalMessage = this.<Long>valueLane().isTransient(true);

  @SwimLane("totalMessages")
  public MapLane<Long, Long> totalMessages = this.<Long, Long>mapLane().isTransient(true);

  @SwimLane("message")
  public ValueLane<Value> message = this.<Value>valueLane().isTransient(true);

  @SwimLane("messages")
  public MapLane<Long, Value> messages = this.<Long, Value>mapLane().isTransient(true);

  @SwimLane("link")
  public ValueLane<Value> link = this.<Value>valueLane().isTransient(true);

  @SwimLane("links")
  public MapLane<Long, Value> links = this.<Long, Value>mapLane().isTransient(true);

  @SwimLane("lastTimestamp")
  public ValueLane<Long> lastTimestamp = this.<Long>valueLane().isTransient(true);

  @SwimLane("cpuUsage")
  public ValueLane<Float> cpuUsage = this.<Float>valueLane().isTransient(true);

  @SwimLane("cpuUsageHistory")
  MapLane<Long, Float> cpuUsageHistory = this.<Long, Float>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.cpuUsageHistory.size() > 200) {
        this.cpuUsageHistory.remove(this.cpuUsageHistory.getIndex(0).getKey());
      }
    })
    .isTransient(true);

  @SwimLane("setCpuUsage")
  public CommandLane<Float> setCpuUsage = this.<Float>commandLane()
      .onCommand((Float newValue) -> {
        cpuUsage.set(newValue);
        final long now = System.currentTimeMillis();
        cpuUsageHistory.put(now, newValue);
          // System.out.println("newValue: " + newValue);
      });  

  private final long startTime = now();


  private void linkToMesh() {
    downlink().nodeUri("swim:meta:mesh").laneUri("meshStats").keepSynced(true).open().onEvent(v -> {
      final MeshStats meshStats = MeshStats.form().cast(v);

      final long currentTime = now();
      final long interval = 10L;
      if (currentTime - lastTimestamp.get() > interval) {
        long delta = (currentTime - startTime) / 1000;
        if (message.get().isDefined()) {
          delta = (currentTime - message.get().get("time").longValue(startTime)) / 1000;
        }
        if (delta == 0) {
          delta = 1;
        }

        final long totMessageCount = meshStats.linkStats().upMessageCount + meshStats.linkStats().downMessageCount;
        final long msgRate = (totMessageCount - message.get().get("message").longValue(0)) / delta;
        final Record msgRec = Record.create(3).slot("time", currentTime).slot("rate", msgRate).slot("message", totMessageCount);
        message.set(msgRec);
        messages.put(currentTime, msgRec);
        if (messages.size() > 200) {
          // messages.drop(messages.size() - 200);
          messages.remove(messages.getIndex(0).getKey());
        }
        totalMessage.set(totMessageCount);
        totalMessages.put(currentTime, totMessageCount);

        final long totLinkCount = meshStats.linkStats().upLinkCount + meshStats.linkStats().downLinkCount;
        final long linkRate = (totLinkCount - link.get().get("link").longValue(0)) / delta;
        final Record linkRec = Record.create(3).slot("time", currentTime).slot("rate", linkRate).slot("link", totLinkCount);
        link.set(linkRec);
        links.put(currentTime, linkRec);
        if (links.size() > 200) {
          // links.drop(links.size() - 200);
          links.remove(links.getIndex(0).getKey());
        }
        lastTimestamp.set(currentTime);
      }
    });
  }

  @Override
  public void didStart() {
    super.didStart();
    System.out.println("didStart IntrospectionAgent");
    linkToMesh();
  }

  private long now() {
    return System.currentTimeMillis();
  }

}
