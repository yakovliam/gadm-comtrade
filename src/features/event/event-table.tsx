import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import useEventStore from "@/core/store/useEventStore";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { SettingsIcon, TrashIcon } from "lucide-react";

type Event = {
  id: string;
  stationName: string;
  recordingDeviceId: string | undefined;
  revisionYear: string;
  lineFrequency: number;
  firstDataPointDateTime: Date;
  triggerDataPointDateTime: Date;
  analogChannelCount: number;
  digitalChannelCount: number;
};

const formatDate = (date: Date) => {
  return date.toLocaleString();
};

const EventTable = () => {
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const events = useEventStore((state) => state.events);

  const tableData = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        stationName: event.config.stationName,
        recordingDeviceId: event.config.recordingDeviceId,
        revisionYear: event.config.revisionYear,
        lineFrequency: event.config.lineFrequency,
        firstDataPointDateTime: event.config.firstDataPointDateTime,
        triggerDataPointDateTime: event.config.triggerDataPointDateTime,
        analogChannelCount: event.config.channelsInfo.analogChannels,
        digitalChannelCount: event.config.channelsInfo.digitalChannels,
      })),
    [events],
  );

  const columns = useMemo<ColumnDef<Event>[]>(
    () => [
      //   {
      //     accessorKey: "id",
      //     header: "ID",
      //     cell: ({ row }) => (
      //       <div className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</div>
      //     ),
      //   },
      {
        accessorKey: "stationName",
        header: "Station",
        cell: ({ row }) => (
          <span className="w-full flex">{row.getValue("stationName")}</span>
        ),
      },
      //   {
      //     accessorKey: "recordingDeviceId",
      //     header: "Recording Device",
      //   },
      {
        accessorKey: "revisionYear",
        header: "Rev.",
        cell: ({ row }) => (
          <span className="w-full flex">{row.getValue("revisionYear")}</span>
        ),
      },
      {
        accessorKey: "lineFrequency",
        header: "Freq (Hz)",
        cell: ({ row }) => (
          <span className="w-full flex">
            {row.getValue("lineFrequency")} Hz
          </span>
        ),
      },
      //   {
      //     accessorKey: "firstDataPointDateTime",
      //     header: "First Data Point",
      //     cell: ({ row }) => <span>{formatDate(row.getValue("firstDataPointDateTime"))}</span>,
      //   },
      //   {
      //     accessorKey: "triggerDataPointDateTime",
      //     header: "Trigger Time",
      //     cell: ({ row }) => <span>{formatDate(row.getValue("triggerDataPointDateTime"))}</span>,
      //   },
      // {
      //   accessorKey: "analogChannelCount",
      //   header: "A_n",
      //   cell: ({ row }) => <span>{row.getValue("analogChannelCount")}</span>,
      // },
      // {
      //   accessorKey: "digitalChannelCount",
      //   header: "D_n",
      //   cell: ({ row }) => <span>{row.getValue("digitalChannelCount")}</span>,
      // },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const eventId = row.original.id;

          return (
            <div className="flex items-start gap-2">
              <Button variant="outline" size="icon">
                <SettingsIcon />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deleteEvent(eventId)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 uppercase"
              >
                <TrashIcon />
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteEvent],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs uppercase">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No events imported. Click "Import Event" to add events.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventTable;
