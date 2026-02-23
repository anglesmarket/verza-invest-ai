import {
  MapPin,
  Calendar,
  UsersRound,
  Globe,
  Eye,
} from "lucide-react";
import { StartupDetail } from "./types";

interface StartupHeaderProps {
  startup: StartupDetail;
}

export default function StartupHeader({ startup }: StartupHeaderProps) {
  return (
    <div className="glass-card p-8 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {startup.logo ? (
          <img
            src={startup.logo}
            alt={startup.name}
            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {startup.name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {startup.name}
            </h1>
            <span className="badge-primary w-fit">{startup.industry}</span>
            {startup.stage && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 w-fit">
                {startup.stage}
              </span>
            )}
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            {startup.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{startup.location}</span>
            </div>
            {startup.founded && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Founded {startup.founded}</span>
              </div>
            )}
            {startup.teamSize > 0 && (
              <div className="flex items-center gap-1">
                <UsersRound className="w-4 h-4" />
                <span>{startup.teamSize} team members</span>
              </div>
            )}
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{startup.website.replace("https://", "")}</span>
              </a>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{startup.viewCount} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
