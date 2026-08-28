import { resourceHubs } from "@/data/academy";
import ResourceHubCard from "@/components/ResourceHubCard";

type Props = {
  /** Path prefix without trailing slash, e.g. /academy/uat or /academy/grades/9 */
  basePath: string;
};

/** Same 6 learning hubs everywhere this structure appears. */
export default function ResourceHubGrid({ basePath }: Props) {
  return (
    <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
      {resourceHubs.map((hub) => (
        <ResourceHubCard key={hub.id} hub={hub} href={`${basePath}/${hub.id}`} />
      ))}
    </div>
  );
}
