
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BusinessTableLoading: React.FC = () => {
  // Create an array with 6 items to represent loading rows
  const loadingRows = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingRows.map((index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessTableLoading;
