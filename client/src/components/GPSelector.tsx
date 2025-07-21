import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GPDataService, GPReference } from "@/lib/gpDataService";
import { Search, MapPin, Ruler, Hash } from "lucide-react";

interface GPSelectorProps {
  onGPSelect: (gp: GPReference) => void;
  selectedGP?: GPReference | null;
  label?: string;
  required?: boolean;
}

export default function GPSelector({ onGPSelect, selectedGP, label = "GP Selection", required = false }: GPSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRing, setSelectedRing] = useState("");
  const [filteredGPs, setFilteredGPs] = useState<GPReference[]>([]);
  const [showResults, setShowResults] = useState(false);

  const districts = GPDataService.getAllDistricts();
  const ringNames = GPDataService.getAllRingNames();

  useEffect(() => {
    let results: GPReference[] = [];

    if (searchQuery) {
      results = GPDataService.searchGPs(searchQuery);
    } else if (selectedDistrict) {
      results = GPDataService.getGPsByDistrict(selectedDistrict);
    } else if (selectedRing) {
      results = GPDataService.getGPsByRing(selectedRing);
    }

    // Apply additional filters
    if (selectedDistrict && results.length > 0) {
      results = results.filter(gp => gp.District === selectedDistrict);
    }
    if (selectedRing && results.length > 0) {
      results = results.filter(gp => gp["Ring Name"] === selectedRing);
    }

    setFilteredGPs(results.slice(0, 50)); // Limit to 50 results for performance
    setShowResults(results.length > 0);
  }, [searchQuery, selectedDistrict, selectedRing]);

  const handleGPSelect = (gp: GPReference) => {
    onGPSelect(gp);
    setShowResults(false);
    setSearchQuery(gp["GP Name"]);
  };

  const clearSelection = () => {
    setSearchQuery("");
    setSelectedDistrict("");
    setSelectedRing("");
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {selectedGP && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">{selectedGP["GP Name"]}</p>
                <div className="text-sm text-green-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedGP.District} - {selectedGP["Originating Mandal"]} to {selectedGP["Terminating Mandal"]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-3 w-3" />
                    <span>Span: {selectedGP["Span length"]} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    <span>Ring: {selectedGP["Ring Name"]}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedGP && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search GP by name, district, or ring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Filter by District</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Districts</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Filter by Ring</Label>
              <Select value={selectedRing} onValueChange={setSelectedRing}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Rings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Rings</SelectItem>
                  {ringNames.slice(0, 20).map(ring => (
                    <SelectItem key={ring} value={ring}>
                      {ring}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {showResults && (
            <Card className="max-h-64 overflow-y-auto">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {filteredGPs.map((gp, index) => (
                    <button
                      key={`${gp["GP Name"]}-${index}`}
                      onClick={() => handleGPSelect(gp)}
                      className="w-full text-left p-3 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium">{gp["GP Name"]}</div>
                      <div className="text-sm text-slate-600">
                        {gp.District} • {gp["Ring Name"]} • Span: {gp["Span length"]} km
                      </div>
                      <div className="text-xs text-slate-500">
                        {gp["Originating Mandal"]} → {gp["Terminating Mandal"]}
                      </div>
                    </button>
                  ))}
                </div>
                
                {filteredGPs.length === 50 && (
                  <p className="text-xs text-slate-500 p-2 text-center border-t">
                    Showing first 50 results. Refine your search for more specific results.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {searchQuery && filteredGPs.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No GPs found matching your search criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}