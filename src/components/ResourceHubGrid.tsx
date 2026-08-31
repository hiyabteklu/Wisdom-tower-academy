import { resourceHubs } from "@/data/academy";
import ResourceHubCard from "@/components/ResourceHubCard";
import { areHubsReady } from "@/data/content-availability";

type Props = {
  /** Path prefix without trailing slash, e.g. /academy/uat or /academy/grades/9 */
  basePath: string;
  /** Override auto lock from content-availability */
  locked?: boolean;
};

/** Same 6 learning hubs everywhere this structure appears. */
export default function ResourceHubGrid({ basePath, locked }: Props) {
  const isLocked = locked ?? !areHubsReady(basePath);

  return (
    <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
      {resourceHubs.map((hub) => (
        <ResourceHubCard
          key={hub.id}
          hub={hub}
          href={`${basePath}/${hub.id}`}
          locked={isLocked}
        />
      ))}
    </div>
  );
}
