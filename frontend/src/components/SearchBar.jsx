import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../lib/api";
import debounce from "lodash/debounce";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = debounce(() => setDebouncedQuery(query), 500);
    handler();
    return () => handler.cancel();
  }, [query]);

  const { data: results = [] } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        className="input input-bordered w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {debouncedQuery.length >= 2 && (
        <div className="absolute z-10 w-full bg-base-100 shadow-lg rounded-box mt-1">
          {results.map((user) => (
            <div key={user._id} className="p-2 hover:bg-base-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <img src={user.profilePicture} className="w-8 h-8 rounded-full" />
                <span>{user.fullName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}