import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GPDataService } from "@/lib/gpDataService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Users, Ruler, Hash, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function GPDashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  
  const totalGPs = GPDataService.getGPCount();
  const districts = GPDataService.getAllDistricts();
  const districtSummary = GPDataService.getDistrictSummary();
  
  const chartData = Object.entries(districtSummary)
    .map(([district, data]) => ({
      district: district.substring(0, 8) + (district.length > 8 ? '...' : ''),
      fullDistrict: district,
      count: data.count,
      totalSpan: Math.round(data.totalSpan * 100) / 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin-dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">GP Reference Database</h1>
              <p className="text-slate-600 mt-2">Complete overview of all {totalGPs.toLocaleString()} GPs in the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Hash className="mr-2 h-4 w-4" />
                {totalGPs.toLocaleString()} Total GPs
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <MapPin className="mr-2 h-4 w-4" />
                {districts.length} Districts
              </Badge>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total GPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGPs.toLocaleString()}</div>
              <p className="text-xs text-slate-600">Registered locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Districts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{districts.length}</div>
              <p className="text-xs text-slate-600">Administrative regions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Ring Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{GPDataService.getAllRingNames().length}</div>
              <p className="text-xs text-slate-600">Fiber ring networks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Mandals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{GPDataService.getMandals().length}</div>
              <p className="text-xs text-slate-600">Sub-administrative units</p>
            </CardContent>
          </Card>
        </div>

        {/* District Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>GPs by District (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.district === label);
                      return item ? item.fullDistrict : label;
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [value, 'GP Count'];
                      if (name === 'totalSpan') return [value + ' km', 'Total Span'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Span Length by District (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.district === label);
                      return item ? item.fullDistrict : label;
                    }}
                    formatter={(value: any) => [value + ' km', 'Total Span Length']}
                  />
                  <Bar dataKey="totalSpan" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* District Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>District Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-slate-600">District</th>
                    <th className="text-right p-3 font-medium text-slate-600">GP Count</th>
                    <th className="text-right p-3 font-medium text-slate-600">Total Span (km)</th>
                    <th className="text-right p-3 font-medium text-slate-600">Avg Span (km)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(districtSummary)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([district, data]) => (
                      <tr key={district} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{district}</td>
                        <td className="p-3 text-right">{data.count.toLocaleString()}</td>
                        <td className="p-3 text-right">{Math.round(data.totalSpan * 100) / 100}</td>
                        <td className="p-3 text-right">{Math.round((data.totalSpan / data.count) * 100) / 100}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>GP Reference Database contains {totalGPs.toLocaleString()} verified locations across {districts.length} districts</p>
          <p className="mt-1">Data includes district names, GP positions, span lengths, mandal codes, and APSFL Ring IDs</p>
        </div>
      </div>
    </div>
  );
}