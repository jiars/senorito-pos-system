<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Services\ExpenseManagement\ExpenseYearlyArchiveService;
use Illuminate\Http\JsonResponse;
use LogicException;
use Throwable;

class ExpenseYearlyArchiveController extends Controller
{
    public function preview(ExpenseYearlyArchiveService $service): JsonResponse
    {
        try {
            // This endpoint only reads counts; it never creates a yearly run.
            return response()->json($service->preview());
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to preview yearly expense archiving. Please retry.',
            ], 500);
        }
    }

    public function store(ExpenseYearlyArchiveService $service): JsonResponse
    {
        try {
            // Reuse the command's Manila-date, transaction and completed-year rules.
            return response()->json($service->archive());
        } catch (LogicException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 409);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to complete yearly expense archiving. Please retry.',
            ], 500);
        }
    }
}
